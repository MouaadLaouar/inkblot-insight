import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  medicalRecordNumber: z.string().min(1, "Medical record number is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  patient?: any;
}

export const PatientDialog = ({ open, onOpenChange, onSuccess, patient }: PatientDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: patient?.first_name || "",
    lastName: patient?.last_name || "",
    medicalRecordNumber: patient?.medical_record_number || "",
    dateOfBirth: patient?.date_of_birth || "",
    gender: patient?.gender || "",
    notes: patient?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const validation = patientSchema.parse(formData);

      const patientData = {
        first_name: validation.firstName,
        last_name: validation.lastName,
        medical_record_number: validation.medicalRecordNumber,
        date_of_birth: validation.dateOfBirth,
        gender: validation.gender || null,
        notes: validation.notes || null,
        created_by: user.id,
      };

      if (patient) {
        const { error } = await supabase
          .from("patients")
          .update(patientData)
          .eq("id", patient.id);

        if (error) throw error;

        toast({
          title: "Patient updated",
          description: "Patient information has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("patients").insert(patientData);

        if (error) {
          if (error.message.includes("duplicate key")) {
            toast({
              title: "Duplicate record",
              description: "A patient with this medical record number already exists",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Patient added",
          description: "New patient has been added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Error saving patient:", error);
        toast({
          title: "Error",
          description: "Failed to save patient information",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {patient ? "Update patient information" : "Enter patient information to create a new record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mrn">Medical Record Number *</Label>
            <Input
              id="mrn"
              value={formData.medicalRecordNumber}
              onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional patient notes..."
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Update" : "Add"} Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
