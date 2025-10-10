import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, LogOut, Plus, TestTube2 } from "lucide-react";
import { PatientDialog } from "@/components/PatientDialog";
import { PatientList } from "@/components/PatientList";

interface DashboardStats {
  totalPatients: number;
  totalTests: number;
  completedTests: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalTests: 0,
    completedTests: 0,
  });
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [patientsResult, testsResult] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("rorschach_tests").select("id, status", { count: "exact" }),
      ]);

      const completedTests = testsResult.data?.filter(t => t.status === "completed").length || 0;

      setStats({
        totalPatients: patientsResult.count || 0,
        totalTests: testsResult.count || 0,
        completedTests,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-clinical-gray/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <TestTube2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Rorschach Scoring</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patient records</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">Rorschach assessments</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground">Successfully scored</p>
            </CardContent>
          </Card>
        </div>

        {/* Patients Section */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patients</CardTitle>
                <CardDescription>Manage your patient records</CardDescription>
              </div>
              <Button onClick={() => setShowPatientDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PatientList onRefresh={loadStats} />
          </CardContent>
        </Card>
      </main>

      <PatientDialog
        open={showPatientDialog}
        onOpenChange={setShowPatientDialog}
        onSuccess={() => {
          loadStats();
          setShowPatientDialog(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
