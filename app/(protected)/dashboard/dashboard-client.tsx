"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Users, FileText, LogOut, Plus, TestTube2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { PatientList } from "@/components/patients/patient-list";
import { usePatients } from "@/hooks/use-patients";
import { useTests } from "@/hooks/use-tests";

export function DashboardClient() {
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const { data: patients } = usePatients();
  const { data: tests } = useTests();

  const stats = {
    totalPatients: patients?.length || 0,
    totalTests: tests?.length || 0,
    completedTests: tests?.filter((t) => t.status === "completed").length || 0,
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <TestTube2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Inkblot Insight</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Dossiers patients actifs
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">
                Évaluations Rorschach
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Tests Terminés
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground">
                Cotations complétées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patients Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patients</CardTitle>
                <CardDescription>Gérez vos dossiers patients</CardDescription>
              </div>
              <Button onClick={() => setShowPatientDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PatientList />
          </CardContent>
        </Card>
      </main>

      <PatientDialog
        open={showPatientDialog}
        onOpenChange={setShowPatientDialog}
      />
    </div>
  );
}
