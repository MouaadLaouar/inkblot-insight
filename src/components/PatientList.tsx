import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
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
import { Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { PatientDialog } from "./PatientDialog";
import { toast } from "@/hooks/use-toast";
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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
  date_of_birth: string;
  gender: string | null;
  notes: string | null;
}

interface PatientListProps {
  onRefresh: () => void;
}

export const PatientList = ({ onRefresh }: PatientListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [user]);

  const loadPatients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("created_by", user.id)
        .order("last_name", { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      toast({
        title: "Error loading patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePatient) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", deletePatient.id);

      if (error) throw error;

      toast({
        title: "Patient deleted",
        description: "Patient record has been removed",
      });

      loadPatients();
      onRefresh();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error deleting patient",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeletePatient(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No patients found. Add your first patient to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>MRN</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.last_name}, {patient.first_name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{patient.medical_record_number}</Badge>
                </TableCell>
                <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                <TableCell>{patient.gender || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/test/${patient.id}`)}
                      title="View tests"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditPatient(patient)}
                      title="Edit patient"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletePatient(patient)}
                      title="Delete patient"
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

      {editPatient && (
        <PatientDialog
          open={!!editPatient}
          onOpenChange={(open) => !open && setEditPatient(null)}
          patient={editPatient}
          onSuccess={() => {
            loadPatients();
            onRefresh();
            setEditPatient(null);
          }}
        />
      )}

      <AlertDialog open={!!deletePatient} onOpenChange={(open) => !open && setDeletePatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletePatient?.first_name} {deletePatient?.last_name}?
              This will also delete all associated test records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
