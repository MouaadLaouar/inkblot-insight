"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePatient, useUpdatePatient, type Patient } from "@/hooks/use-patients";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  medicalRecordNumber: z.string().min(1, "Medical record number is required").max(50),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  patient?: Patient | null;
}

export function PatientDialog({
  open,
  onOpenChange,
  onSuccess,
  patient,
}: PatientDialogProps) {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const isLoading = createPatient.isPending || updatePatient.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      medicalRecordNumber: "",
      dateOfBirth: "",
      gender: "",
      notes: "",
    },
  });

  const gender = watch("gender");

  useEffect(() => {
    if (patient) {
      setValue("firstName", patient.firstName);
      setValue("lastName", patient.lastName);
      setValue("medicalRecordNumber", patient.medicalRecordNumber);
      setValue("dateOfBirth", patient.dateOfBirth);
      setValue("gender", patient.gender || "");
      setValue("notes", patient.notes || "");
    } else {
      reset();
    }
  }, [patient, setValue, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (patient) {
        await updatePatient.mutateAsync({
          id: patient.id,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            medicalRecordNumber: data.medicalRecordNumber,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            notes: data.notes,
          },
        });
        toast.success("Patient mis à jour avec succès");
      } else {
        await createPatient.mutateAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          medicalRecordNumber: data.medicalRecordNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          notes: data.notes,
        });
        toast.success("Patient ajouté avec succès");
      }

      onOpenChange(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {patient ? "Modifier le patient" : "Ajouter un patient"}
          </DialogTitle>
          <DialogDescription>
            {patient
              ? "Modifier les informations du patient"
              : "Entrez les informations du patient pour créer un nouveau dossier"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalRecordNumber">Numéro de dossier *</Label>
            <Input
              id="medicalRecordNumber"
              {...register("medicalRecordNumber")}
              disabled={isLoading}
            />
            {errors.medicalRecordNumber && (
              <p className="text-sm text-destructive">
                {errors.medicalRecordNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date de naissance *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Genre</Label>
              <Select
                value={gender}
                onValueChange={(value) => setValue("gender", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Homme</SelectItem>
                  <SelectItem value="Female">Femme</SelectItem>
                  <SelectItem value="Other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notes supplémentaires..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
