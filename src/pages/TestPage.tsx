import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Loader2, TestTube2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
}

interface Test {
  id: string;
  test_date: string;
  status: string;
  total_responses: number;
}

const TestPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [patientId, user]);

  const loadData = async () => {
    if (!user || !patientId) return;

    try {
      const [patientResult, testsResult] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patientId).single(),
        supabase.from("rorschach_tests").select("*").eq("patient_id", patientId).order("test_date", { ascending: false }),
      ]);

      if (patientResult.error) throw patientResult.error;
      if (testsResult.error) throw testsResult.error;

      setPatient(patientResult.data);
      setTests(testsResult.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error loading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewTest = async () => {
    if (!user || !patientId) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("rorschach_tests")
        .insert({
          patient_id: patientId,
          created_by: user.id,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Test created",
        description: "New Rorschach test has been created",
      });

      navigate(`/scoring/${data.id}`);
    } catch (error) {
      console.error("Error creating test:", error);
      toast({
        title: "Error creating test",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Patient not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-clinical-gray/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {patient.last_name}, {patient.first_name}
              </h1>
              <p className="text-sm text-muted-foreground">MRN: {patient.medical_record_number}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rorschach Tests</CardTitle>
                <CardDescription>View and manage test assessments</CardDescription>
              </div>
              <Button onClick={createNewTest} disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                New Test
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tests found. Create a new test to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <Card
                    key={test.id}
                    className="cursor-pointer transition-all hover:shadow-soft"
                    onClick={() => navigate(`/scoring/${test.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <TestTube2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Test Date: {new Date(test.test_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {test.total_responses} responses recorded
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={test.status === "completed" ? "default" : "secondary"}
                      >
                        {test.status.replace("_", " ")}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TestPage;
