"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Loader2, TestTube2, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { usePatient } from "@/hooks/use-patients";
import { useTests, useCreateTest, useDeleteTest } from "@/hooks/use-tests";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: tests, isLoading: testsLoading } = useTests(patientId);
  const createTest = useCreateTest();
  const deleteTest = useDeleteTest();

  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const handleCreateTest = async () => {
    try {
      const newTest = await createTest.mutateAsync({ patientId });
      toast.success("Test créé avec succès");
      router.push(`/scoring/${newTest.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du test");
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;

    try {
      await deleteTest.mutateAsync(testToDelete);
      toast.success("Test supprimé avec succès");
      setTestToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  if (patientLoading || testsLoading) {
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
          <p className="text-muted-foreground">Patient non trouvé</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {patient.lastName}, {patient.firstName}
              </h1>
              <p className="text-sm text-muted-foreground">
                N° Dossier: {patient.medicalRecordNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tests Rorschach</CardTitle>
                <CardDescription>
                  Voir et gérer les évaluations de test
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateTest}
                disabled={createTest.isPending}
              >
                {createTest.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Nouveau Test
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!tests || tests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucun test trouvé. Créez un nouveau test pour commencer.
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <Card
                    key={test.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <TestTube2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Date du test:{" "}
                            {new Date(test.testDate).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {test.totalResponses} réponses enregistrées
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <Badge
                          variant={
                            test.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {test.status === "completed"
                            ? "Terminé"
                            : "En cours"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/scoring/${test.id}`)}
                        >
                          Coter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/results/${test.id}`)}
                        >
                          Résultats
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setTestToDelete(test.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Êtes-vous sûr ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Cela supprimera
                                définitivement le test et toutes les données
                                associées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteTest}>
                                Supprimer
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
}
