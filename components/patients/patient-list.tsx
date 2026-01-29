"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash2, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PatientDialog } from "./patient-dialog";
import { usePatients, useDeletePatient, type Patient } from "@/hooks/use-patients";

export function PatientList() {
  const router = useRouter();
  const { data: patients, isLoading } = usePatients();
  const deletePatient = useDeletePatient();

  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatientState, setDeletePatientState] = useState<Patient | null>(null);

  const handleDelete = async () => {
    if (!deletePatientState) return;

    try {
      await deletePatient.mutateAsync(deletePatientState.id);
      toast.success("Patient supprimé avec succès");
      setDeletePatientState(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Aucun patient trouvé. Ajoutez votre premier patient pour commencer.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>N° Dossier</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.lastName}, {patient.firstName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{patient.medicalRecordNumber}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  {patient.gender === "Male"
                    ? "Homme"
                    : patient.gender === "Female"
                    ? "Femme"
                    : patient.gender || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{patient._count?.tests || 0}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/test/${patient.id}`)}
                      title="Voir les tests"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditPatient(patient)}
                      title="Modifier le patient"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletePatientState(patient)}
                      title="Supprimer le patient"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PatientDialog
        open={!!editPatient}
        onOpenChange={(open) => !open && setEditPatient(null)}
        patient={editPatient}
      />

      <AlertDialog
        open={!!deletePatientState}
        onOpenChange={(open) => !open && setDeletePatientState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le patient</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {deletePatientState?.firstName}{" "}
              {deletePatientState?.lastName} ? Cette action supprimera également
              tous les tests associés et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePatient.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePatient.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deletePatient.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
