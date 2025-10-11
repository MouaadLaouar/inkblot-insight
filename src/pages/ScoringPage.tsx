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
import { ArrowLeft, Save, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const responseSchema = z.object({
  responseText: z.string().min(1, "Response text is required").max(1000),
  location: z.string().max(100).optional(),
  determinants: z.array(z.string()).optional(),
  contentCategories: z.array(z.string()).optional(),
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
    determinants: "",
    contentCategories: "",
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
        determinants: newResponse.determinants ? newResponse.determinants.split(",").map(d => d.trim()) : [],
        contentCategories: newResponse.contentCategories ? newResponse.contentCategories.split(",").map(c => c.trim()) : [],
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

      setNewResponse({ responseText: "", location: "", determinants: "", contentCategories: "" });
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

  const cardResponses = responses.filter(r => r.card_number === selectedCard);

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

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newResponse.location}
                  onChange={(e) => setNewResponse({ ...newResponse, location: e.target.value })}
                  placeholder="W, D, Dd, S"
                  disabled={saving || test.status === "completed"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="determinants">Determinants</Label>
                <Input
                  id="determinants"
                  value={newResponse.determinants}
                  onChange={(e) => setNewResponse({ ...newResponse, determinants: e.target.value })}
                  placeholder="F, M, C, FC (comma-separated)"
                  disabled={saving || test.status === "completed"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content Categories</Label>
                <Input
                  id="content"
                  value={newResponse.contentCategories}
                  onChange={(e) => setNewResponse({ ...newResponse, contentCategories: e.target.value })}
                  placeholder="H, A, An, Obj (comma-separated)"
                  disabled={saving || test.status === "completed"}
                />
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

        {/* Existing Responses */}
        {cardResponses.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Card {selectedCard} - Recorded Responses</CardTitle>
              <CardDescription>{cardResponses.length} response(s) recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardResponses.map((response) => (
                  <Card key={response.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <Badge>Response {response.response_number}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteResponse(response.id)}
                            disabled={saving || test.status === "completed"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">{response.response_text}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {response.location && <span>Location: {response.location}</span>}
                          {response.determinants.length > 0 && (
                            <span>Determinants: {response.determinants.join(", ")}</span>
                          )}
                          {response.content_categories.length > 0 && (
                            <span>Content: {response.content_categories.join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ScoringPage;
