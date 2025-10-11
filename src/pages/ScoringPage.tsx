import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, CheckCircle, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectionModal from "@/components/SelectionModal";
import { LOCATION_OPTIONS, DETERMINANT_OPTIONS, CONTENT_OPTIONS } from "@/lib/rorschachConstants";

const responseSchema = z.object({
  responseText: z.string().min(1, "Response text is required").max(1000),
  location: z.string().max(100).optional(),
  determinants: z.array(z.string()).optional(),
  contentCategories: z.array(z.string()).optional(),
  cValue: z.string().optional(),
  ban: z.string().optional(),
  obs: z.string().optional(),
  intenseTime: z.number().optional(),
});

interface TestData {
  id: string;
  patient_id: string;
  test_date: string;
  status: string;
  notes: string | null;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface Response {
  id: string;
  card_number: number;
  response_number: number;
  response_text: string;
  location: string | null;
  determinants: string[];
  content_categories: string[];
  c_value: string | null;
  ban: string | null;
  obs: string | null;
  intense_time: number | null;
}

const ScoringPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState<TestData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedCard, setSelectedCard] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newResponse, setNewResponse] = useState({
    responseText: "",
    location: "",
    determinants: [] as string[],
    contentCategories: [] as string[],
    cValue: "",
    ban: "",
    obs: "",
    intenseTime: "",
  });
  
  const [modalState, setModalState] = useState<{
    type: "location" | "determinants" | "content" | null;
    open: boolean;
  }>({ type: null, open: false });

  // Table columns definition - must be before any conditional returns
  const columns: ColumnDef<Response>[] = [
    {
      accessorKey: "response_number",
      header: "Resp #",
      cell: ({ row }) => <Badge variant="outline">{row.original.response_number}</Badge>,
    },
    {
      accessorKey: "card_number",
      header: "Card",
      cell: ({ row }) => <span className="font-medium">{row.original.card_number}</span>,
    },
    {
      accessorKey: "response_text",
      header: "Response Text",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{row.original.response_text}</p>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm">{row.original.location || "-"}</span>,
    },
    {
      accessorKey: "determinants",
      header: "D",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.determinants.join(", ") || "-"}</span>
      ),
    },
    {
      accessorKey: "c_value",
      header: "C",
      cell: ({ row }) => <span className="text-sm">{row.original.c_value || "-"}</span>,
    },
    {
      accessorKey: "ban",
      header: "Ban",
      cell: ({ row }) => <span className="text-sm">{row.original.ban || "-"}</span>,
    },
    {
      accessorKey: "obs",
      header: "Obs",
      cell: ({ row }) => <span className="text-sm">{row.original.obs || "-"}</span>,
    },
    {
      accessorKey: "intense_time",
      header: "Time",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.intense_time ? `${row.original.intense_time}s` : "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteResponse(row.original.id)}
          disabled={saving || test?.status === "completed"}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  const cardResponses = responses.filter(r => r.card_number === selectedCard);
  
  const table = useReactTable({
    data: cardResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    loadTestData();
  }, [testId, user]);

  const loadTestData = async () => {
    if (!user || !testId) return;

    try {
      const [testResult, responsesResult] = await Promise.all([
        supabase.from("rorschach_tests").select("*, patients(first_name, last_name)").eq("id", testId).single(),
        supabase.from("test_responses").select("*").eq("test_id", testId).order("card_number").order("response_number"),
      ]);

      if (testResult.error) throw testResult.error;
      if (responsesResult.error) throw responsesResult.error;

      setTest(testResult.data);
      setResponses(responsesResult.data || []);
    } catch (error) {
      console.error("Error loading test data:", error);
      toast({
        title: "Error loading test data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async () => {
    if (!user || !testId) return;

    setSaving(true);
    try {
      const validation = responseSchema.parse({
        responseText: newResponse.responseText,
        location: newResponse.location || undefined,
        determinants: newResponse.determinants,
        contentCategories: newResponse.contentCategories,
        cValue: newResponse.cValue || undefined,
        ban: newResponse.ban || undefined,
        obs: newResponse.obs || undefined,
        intenseTime: newResponse.intenseTime ? parseInt(newResponse.intenseTime) : undefined,
      });

      const cardResponses = responses.filter(r => r.card_number === selectedCard);
      const nextResponseNumber = cardResponses.length + 1;

      const { error } = await supabase.from("test_responses").insert({
        test_id: testId,
        card_number: selectedCard,
        response_number: nextResponseNumber,
        response_text: validation.responseText,
        location: validation.location || null,
        determinants: validation.determinants || [],
        content_categories: validation.contentCategories || [],
        c_value: validation.cValue || null,
        ban: validation.ban || null,
        obs: validation.obs || null,
        intense_time: validation.intenseTime || null,
      });

      if (error) throw error;

      // Update total responses count
      await supabase
        .from("rorschach_tests")
        .update({ total_responses: responses.length + 1 })
        .eq("id", testId);

      toast({
        title: "Response saved",
        description: `Card ${selectedCard}, Response ${nextResponseNumber} saved`,
      });

      setNewResponse({ 
        responseText: "", 
        location: "", 
        determinants: [], 
        contentCategories: [],
        cValue: "",
        ban: "",
        obs: "",
        intenseTime: "",
      });
      loadTestData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Error saving response:", error);
        toast({
          title: "Error saving response",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const markAsCompleted = async () => {
    if (!testId) return;

    try {
      const { error } = await supabase
        .from("rorschach_tests")
        .update({ status: "completed" })
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test completed",
        description: "Test has been marked as completed",
      });

      loadTestData();
    } catch (error) {
      console.error("Error completing test:", error);
      toast({
        title: "Error completing test",
        variant: "destructive",
      });
    }
  };

  const deleteResponse = async (responseId: string) => {
    if (!user || !testId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("test_responses").delete().eq("id", responseId);

      if (error) throw error;

      // Update total responses count
      await supabase
        .from("rorschach_tests")
        .update({ total_responses: responses.length - 1 })
        .eq("id", testId);

      toast({
        title: "Response deleted",
        description: "Response successfully removed.",
      });
      loadTestData();
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error deleting response",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Test not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleModalSelect = (value: string) => {
    if (modalState.type === "location") {
      setNewResponse({ ...newResponse, location: value });
    } else if (modalState.type === "determinants") {
      const current = newResponse.determinants;
      setNewResponse({
        ...newResponse,
        determinants: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    } else if (modalState.type === "content") {
      const current = newResponse.contentCategories;
      setNewResponse({
        ...newResponse,
        contentCategories: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-clinical-gray/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/test/${test.patient_id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                Rorschach Scoring - {test.patients.last_name}, {test.patients.first_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Test Date: {new Date(test.test_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {test.status !== "completed" && (
            <Button onClick={markAsCompleted} variant="secondary">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card Selection */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle>Cards (I-X)</CardTitle>
              <CardDescription>Select a card to score responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => {
                  const cardResponseCount = responses.filter(r => r.card_number === card).length;
                  return (
                    <Button
                      key={card}
                      variant={selectedCard === card ? "default" : "outline"}
                      onClick={() => setSelectedCard(card)}
                      className="relative"
                    >
                      Card {card}
                      {cardResponseCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {cardResponseCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Response Entry */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle>Card {selectedCard} - Add Response</CardTitle>
              <CardDescription>
                Enter patient's response and scoring details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="response">Response Text *</Label>
                <Textarea
                  id="response"
                  value={newResponse.responseText}
                  onChange={(e) => setNewResponse({ ...newResponse, responseText: e.target.value })}
                  placeholder="Patient's verbal response to the card..."
                  disabled={saving || test.status === "completed"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setModalState({ type: "location", open: true })}
                    disabled={saving || test.status === "completed"}
                  >
                    {newResponse.location || "Select Location"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Determinants (D)</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setModalState({ type: "determinants", open: true })}
                    disabled={saving || test.status === "completed"}
                  >
                    {newResponse.determinants.length > 0
                      ? newResponse.determinants.join(", ")
                      : "Select Determinants"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content (C)</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setModalState({ type: "content", open: true })}
                    disabled={saving || test.status === "completed"}
                  >
                    {newResponse.contentCategories.length > 0
                      ? newResponse.contentCategories.join(", ")
                      : "Select Content"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cValue">C Value</Label>
                  <Input
                    id="cValue"
                    value={newResponse.cValue}
                    onChange={(e) => setNewResponse({ ...newResponse, cValue: e.target.value })}
                    placeholder="Enter C value"
                    disabled={saving || test.status === "completed"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ban">Ban</Label>
                  <Input
                    id="ban"
                    value={newResponse.ban}
                    onChange={(e) => setNewResponse({ ...newResponse, ban: e.target.value })}
                    placeholder="Ban"
                    disabled={saving || test.status === "completed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obs">Obs</Label>
                  <Input
                    id="obs"
                    value={newResponse.obs}
                    onChange={(e) => setNewResponse({ ...newResponse, obs: e.target.value })}
                    placeholder="Obs"
                    disabled={saving || test.status === "completed"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intenseTime">Time (seconds)</Label>
                  <Input
                    id="intenseTime"
                    type="number"
                    value={newResponse.intenseTime}
                    onChange={(e) => setNewResponse({ ...newResponse, intenseTime: e.target.value })}
                    placeholder="0"
                    disabled={saving || test.status === "completed"}
                  />
                </div>
              </div>

              {test.status !== "completed" && (
                <Button onClick={saveResponse} disabled={saving || !newResponse.responseText} className="w-full">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Response
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Responses Table */}
        {cardResponses.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Card {selectedCard} - Recorded Responses</CardTitle>
              <CardDescription>{cardResponses.length} response(s) recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No responses recorded for this card yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selection Modals */}
        <SelectionModal
          open={modalState.type === "location" && modalState.open}
          onOpenChange={(open) => setModalState({ ...modalState, open })}
          title="Select Location"
          options={LOCATION_OPTIONS}
          onSelect={handleModalSelect}
        />
        <SelectionModal
          open={modalState.type === "determinants" && modalState.open}
          onOpenChange={(open) => setModalState({ ...modalState, open })}
          title="Select Determinants"
          options={DETERMINANT_OPTIONS}
          onSelect={handleModalSelect}
          multiSelect
          selectedValues={newResponse.determinants}
        />
        <SelectionModal
          open={modalState.type === "content" && modalState.open}
          onOpenChange={(open) => setModalState({ ...modalState, open })}
          title="Select Content Categories"
          options={CONTENT_OPTIONS}
          onSelect={handleModalSelect}
          multiSelect
          selectedValues={newResponse.contentCategories}
        />
      </main>
    </div>
  );
};

export default ScoringPage;
