import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Loader2, TestTube2, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";

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
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [creating, setCreating] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  // console.log("TestPage: patientId", patientId);
  // console.log("TestPage: user", user);

  const { data: tests, isLoading, refetch } = useQuery<Test[]>({
    queryKey: ["tests", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("rorschach_tests")
        .select("*")
        .eq("patient_id", patientId)
        .order("test_date", { ascending: false });
      if (error) {
        console.error("Error fetching tests:", error);
        throw new Error(error.message);
      }
      // console.log("TestPage: fetched tests", data);
      return data;
    },
    enabled: !!patientId,
  });

  useEffect(() => {
    // console.log("TestPage: useEffect triggered");
    loadPatientData();
  }, [patientId, user]);

  const loadPatientData = async () => {
    if (!user || !patientId) {
      // console.log("TestPage: loadPatientData skipped, user or patientId missing");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) throw error;

      setPatient(data);
      // console.log("TestPage: fetched patient", data);
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast({
        title: "Error loading patient data",
        variant: "destructive",
      });
    } finally {
      // setLoading(false); // This was removed as isLoading is handled by useQuery
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

  const handleDeleteTest = async () => {
    if (!testToDelete) return;

    const { error } = await supabase
      .from("rorschach_tests")
      .delete()
      .eq("id", testToDelete.id);

    if (error) {
      toast({
        title: "Error deleting test",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Test deleted",
        description: "The test has been successfully deleted.",
      });
      refetch();
    }
    setTestToDelete(null);
  };

  // console.log("TestPage: isLoading", isLoading);
  // console.log("TestPage: patient", patient);
  // console.log("TestPage: tests", tests);

  if (isLoading) {
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
            {tests && tests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tests found. Create a new test to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {tests?.map((test) => (
                  <Card
                    key={test.id}
                    className="transition-all hover:shadow-soft"
                  >
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
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
                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <Badge
                          variant={test.status === "completed" ? "default" : "secondary"}
                        >
                          {test.status.replace("_", " ")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/scoring/${test.id}`)}
                        >
                          Score Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/results/${test.id}`)}
                        >
                          View Results
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTestToDelete(test);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                your test and remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTest();
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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