import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectionModal from "@/components/SelectionModal";
import { LOCATION_OPTIONS, DETERMINANT_OPTIONS, CONTENT_OPTIONS } from "@/lib/rorschachConstants";

interface TestData {
  id: string;
  patient_id: string;
  test_date: string;
  status: string;
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
  determinants: string | null;
  content_categories: string | null;
  ban: boolean;
  obs: string | null;
  intense_time: number | null;
  response_time: number | null;
}

interface NewResponseForm {
  responseText: string;
  location: string;
  determinants: string;
  contentCategories: string;
  ban: boolean;
  obs: string;
  intenseTime: { minutes: string; seconds: string };
  responseTime: { minutes: string; seconds: string };
}

const INITIAL_FORM_STATE: NewResponseForm = {
  responseText: "",
  location: "",
  determinants: "",
  contentCategories: "",
  ban: false,
  obs: "",
  intenseTime: { minutes: "", seconds: "" },
  responseTime: { minutes: "", seconds: "" },
};

const ScoringPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [test, setTest] = useState<TestData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedCard, setSelectedCard] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState<NewResponseForm>(INITIAL_FORM_STATE);
  const [modalState, setModalState] = useState<{
    type: "location" | "determinants" | "content" | null;
    open: boolean;
  }>({ type: null, open: false });

  // Memoized filtered responses for selected card
  const cardResponses = useMemo(
    () => responses.filter((r) => r.card_number === selectedCard),
    [responses, selectedCard]
  );

  // Memoized card response counts
  const cardCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) {
      counts[i] = responses.filter((r) => r.card_number === i).length;
    }
    return counts;
  }, [responses]);

  // Table columns definition with delete action
  const columns = useMemo<ColumnDef<Response>[]>(
    () => [
      {
        accessorKey: "response_number",
        header: "Resp #",
        cell: ({ row }) => <div className="font-medium">{row.original.response_number}</div>,
      },
      {
        accessorKey: "card_number",
        header: "Card",
        cell: ({ row }) => <Badge variant="outline">{row.original.card_number}</Badge>,
      },
      {
        accessorKey: "response_text",
        header: "Response Text",
        cell: ({ row }) => <div className="max-w-md truncate">{row.original.response_text}</div>,
      },
      {
        accessorKey: "location",
        header: "Loc",
        cell: ({ row }) => <Badge variant="secondary">{row.original.location || "-"}</Badge>,
      },
      {
        accessorKey: "determinants",
        header: "D",
        cell: ({ row }) => <div className="text-sm">{row.original.determinants}</div>,
      },
      {
        accessorKey: "content_categories",
        header: "C",
        cell: ({ row }) => <div className="text-sm">{row.original.content_categories}</div>,
      },
      {
        accessorKey: "ban",
        header: "Ban",
        cell: ({ row }) => <div className="text-sm">{row.original.ban ? "Oui" : "Non"}</div>,
      },
      {
        accessorKey: "obs",
        header: "Obs",
        cell: ({ row }) => <div className="text-sm truncate max-w-[100px]">{row.original.obs || "-"}</div>,
      },
      {
        accessorKey: "intense_time",
        header: "TL",
        cell: ({ row }) => {
          const seconds = row.original.intense_time;
          if (!seconds) return <div className="text-sm">-</div>;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return <div className="text-sm">{mins}:{secs.toString().padStart(2, "0")}</div>;
        },
      },
      {
        accessorKey: "response_time",
        header: "TR",
        cell: ({ row }) => {
          const seconds = row.original.response_time;
          if (!seconds) return <div className="text-sm">-</div>;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return <div className="text-sm">{mins}:{secs.toString().padStart(2, "0")}</div>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteResponse(row.original.id)}
            disabled={deleting === row.original.id}
          >
            {deleting === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        ),
      },
    ],
    [deleting]
  );

  const table = useReactTable({
    data: cardResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Load initial data only on mount
  useEffect(() => {
    if (user && testId) {
      loadTestData();
    }
  }, [testId, user]);

  const loadTestData = async () => {
    if (!user || !testId) return;
    
    try {
      const [testResult, responsesResult] = await Promise.all([
        supabase
          .from("rorschach_tests")
          .select("*, patients(first_name, last_name)")
          .eq("id", testId)
          .single(),
        supabase
          .from("test_responses")
          .select("*")
          .eq("test_id", testId)
          .order("card_number")
          .order("response_number"),
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

  const handleSaveResponse = useCallback(async () => {
    if (!user || !testId || !newResponse.responseText.trim()) return;

    setSaving(true);
    try {
      // Convert time to seconds
      const intenseTimeInSeconds =
        (parseInt(newResponse.intenseTime.minutes) || 0) * 60 +
        (parseInt(newResponse.intenseTime.seconds) || 0);

      const responseTimeInSeconds =
        (parseInt(newResponse.responseTime.minutes) || 0) * 60 +
        (parseInt(newResponse.responseTime.seconds) || 0);

      const cardResponses = responses.filter((r) => r.card_number === selectedCard);
      const nextResponseNumber = cardResponses.length + 1;

      const newResponseData = {
        test_id: testId,
        card_number: selectedCard,
        response_number: nextResponseNumber,
        response_text: newResponse.responseText.trim(),
        location: newResponse.location,
        determinants: newResponse.determinants,
        content_categories: newResponse.contentCategories,
        ban: newResponse.ban,
        obs: newResponse.obs || null,
        intense_time: intenseTimeInSeconds > 0 ? intenseTimeInSeconds : null,
        response_time: responseTimeInSeconds > 0 ? responseTimeInSeconds : null,
      };

      const { data, error } = await supabase
        .from("test_responses")
        .insert(newResponseData)
        .select()
        .single();

      if (error) throw error;

      // Optimistically update state instead of reloading
      setResponses((prev) => [...prev, data]);

      // Update total count in background
      supabase
        .from("rorschach_tests")
        .update({ total_responses: responses.length + 1 })
        .eq("id", testId)
        .then();

      toast({
        title: "Response saved",
        description: `Card ${selectedCard}, Response ${nextResponseNumber} saved successfully`,
      });

      // Reset form
      setNewResponse(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error saving response:", error);
      toast({
        title: "Error saving response",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [user, testId, newResponse, selectedCard, responses]);

  const handleDeleteResponse = useCallback(async (responseId: string) => {
    if (!user || !testId) return;

    setDeleting(responseId);
    try {
      const { error } = await supabase
        .from("test_responses")
        .delete()
        .eq("id", responseId);

      if (error) throw error;

      // Optimistically update state
      setResponses((prev) => prev.filter((r) => r.id !== responseId));

      // Update total count in background
      supabase
        .from("rorschach_tests")
        .update({ total_responses: responses.length - 1 })
        .eq("id", testId)
        .then();

      toast({
        title: "Response deleted",
        description: "Response successfully removed",
      });
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error deleting response",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  }, [user, testId, responses]);

  const handleModalSelect = useCallback((value: string) => {
    if (modalState.type === "location") {
      setNewResponse((prev) => ({ ...prev, location: value }));
    } else if (modalState.type === "determinants") {
      setNewResponse((prev) => ({ ...prev, determinants: value }));
    } else if (modalState.type === "content") {
      setNewResponse((prev) => ({ ...prev, contentCategories: value }));
    }
  }, [modalState.type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Test not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Rorschach Test - {test.patients.first_name} {test.patients.last_name}
            </h1>
            <p className="text-muted-foreground">
              {new Date(test.test_date).toLocaleDateString()} • {responses.length} total responses
            </p>
          </div>
        </div>
        <Badge variant={test.status === "completed" ? "default" : "secondary"}>
          {test.status}
        </Badge>
      </div>

      {/* Card Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Cards (I-X)</CardTitle>
          <CardDescription>Select a card to add responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => (
              <Button
                key={card}
                variant={selectedCard === card ? "default" : "outline"}
                onClick={() => setSelectedCard(card)}
                className="relative"
              >
                Card {card}
                {cardCounts[card] > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {cardCounts[card]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Plus className="inline mr-2 h-5 w-5" />
            Card {selectedCard} - Add New Response
          </CardTitle>
          <CardDescription>Enter patient's response and scoring details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responseText">Response Text *</Label>
            <Textarea
              id="responseText"
              value={newResponse.responseText}
              onChange={(e) => setNewResponse({ ...newResponse, responseText: e.target.value })}
              placeholder="Patient's verbal response to the card..."
              disabled={saving}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setModalState({ type: "location", open: true })}
                disabled={saving}
              >
                {newResponse.location || "Select Location"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Determinants (D)</Label>
              <Button
                variant="outline"
                className="w-full justify-start truncate"
                onClick={() => setModalState({ type: "determinants", open: true })}
                disabled={saving}
              >
                {newResponse.determinants.length > 0
                  ? newResponse.determinants
                  : "Select Determinants"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Content (C)</Label>
              <Button
                variant="outline"
                className="w-full justify-start truncate"
                onClick={() => setModalState({ type: "content", open: true })}
                disabled={saving}
              >
                {newResponse.contentCategories.length > 0
                  ? newResponse.contentCategories
                  : "Select Content"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latency Time (TL)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={newResponse.intenseTime.minutes}
                  onChange={(e) =>
                    setNewResponse({
                      ...newResponse,
                      intenseTime: { ...newResponse.intenseTime, minutes: e.target.value },
                    })
                  }
                  placeholder="Min"
                  disabled={saving}
                />
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={newResponse.intenseTime.seconds}
                  onChange={(e) =>
                    setNewResponse({
                      ...newResponse,
                      intenseTime: { ...newResponse.intenseTime, seconds: e.target.value },
                    })
                  }
                  placeholder="Sec"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Response Time (TR)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={newResponse.responseTime.minutes}
                  onChange={(e) =>
                    setNewResponse({
                      ...newResponse,
                      responseTime: { ...newResponse.responseTime, minutes: e.target.value },
                    })
                  }
                  placeholder="Min"
                  disabled={saving}
                />
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={newResponse.responseTime.seconds}
                  onChange={(e) =>
                    setNewResponse({
                      ...newResponse,
                      responseTime: { ...newResponse.responseTime, seconds: e.target.value },
                    })
                  }
                  placeholder="Sec"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ban">Ban</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Non</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newResponse.ban}
                  onClick={() => setNewResponse({ ...newResponse, ban: !newResponse.ban })}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    newResponse.ban ? "bg-primary" : "bg-gray-200"
                  } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newResponse.ban ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm">Oui</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observations</Label>
              <Input
                id="obs"
                value={newResponse.obs}
                onChange={(e) => setNewResponse({ ...newResponse, obs: e.target.value })}
                placeholder="Observations"
                disabled={saving}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveResponse}
            disabled={saving || !newResponse.responseText.trim()}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Response
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Responses Table */}
      {cardResponses.length > 0 && (
        <Card>
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
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
        selectedValues={newResponse.determinants}
      />
      <SelectionModal
        open={modalState.type === "content" && modalState.open}
        onOpenChange={(open) => setModalState({ ...modalState, open })}
        title="Select Content Categories"
        options={CONTENT_OPTIONS}
        onSelect={handleModalSelect}
        selectedValues={newResponse.contentCategories}
      />
    </div>
  );
};

export default ScoringPage;
