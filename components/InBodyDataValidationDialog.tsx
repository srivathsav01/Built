"use client";

import { useState, useEffect } from "react";
import { InBodyData } from "@/lib/inbody";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { AlertTriangle, Info } from "lucide-react";

type InBodyDataValidationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: InBodyData;
  onConfirm: (data: InBodyData) => void;
  isManualEntry?: boolean;
};

type FieldConfig = {
  key: keyof InBodyData;
  label: string;
  unit?: string;
  isRequired?: boolean;
};

const FIELD_CONFIG: FieldConfig[] = [
  { key: "weight", label: "Weight", unit: "kg", isRequired: true },
  { key: "height", label: "Height", unit: "cm", isRequired: true },
  { key: "age", label: "Age", unit: "years", isRequired: true },
  { key: "totalBodyWater", label: "Total Body Water", unit: "L", isRequired: false },
  { key: "protein", label: "Protein", unit: "kg", isRequired: false },
  { key: "mineral", label: "Mineral", unit: "kg", isRequired: false },
  { key: "bodyFatMass", label: "Body Fat Mass", unit: "kg", isRequired: false },
  { key: "skeletalMuscleMass", label: "Skeletal Muscle Mass", unit: "kg", isRequired: false },
  { key: "bmi", label: "BMI", unit: "kg/m²", isRequired: false },
  { key: "pbf", label: "Percent Body Fat", unit: "%", isRequired: true },
  { key: "testDateTime", label: "Test Date/Time", isRequired: true },
];

export function InBodyDataValidationDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  isManualEntry = false,
}: InBodyDataValidationDialogProps) {
  const [formData, setFormData] = useState<InBodyData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const hasNullValues = Object.values(initialData).some(
    (value) => value === null
  );

  const handleFieldChange = (key: keyof InBodyData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: key === "testDateTime" 
        ? value || null
        : value === "" ? null : parseFloat(value),
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
    onOpenChange(false);
  };

  const isDisabled = () => {
    // Check required fields
    for (const { key, isRequired } of FIELD_CONFIG) {
      if (isRequired && (formData[key] === null || formData[key] === "")) {
        return true;
      }
    }
    return false;
  }

  // Convert "DD.MM.YYYY HH:mm" to "YYYY-MM-DDTHH:mm" for datetime-local input
  const convertToDateTimeLocal = (value: string | null): string => {
    if (!value) return "";
    // Check if already in ISO format
    if (value.includes("T")) return value;
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/);
    if (match) {
      const [, day, month, year, hour, minute] = match;
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    return value;
  };

  const formatValue = (value: number | string | null, key: keyof InBodyData): string => {
    if (value === null) return "";
    if (key === "testDateTime") {
      return convertToDateTimeLocal(String(value));
    }
    return String(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isManualEntry ? "Enter InBody Report Data" : "Review Extracted Data"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isManualEntry
              ? "Please enter the values from your InBody report."
              : "Please verify the values extracted from your InBody report before proceeding."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {!isManualEntry && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                Optical character recognition (OCR) may occasionally produce inaccurate results. 
                Please review and correct any values as needed before confirming.
              </AlertDescription>
            </Alert>
          )}

          {!isManualEntry && hasNullValues && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Incomplete Data Detected</AlertTitle>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            {FIELD_CONFIG.map(({ key, label, unit, isRequired }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {label}
                  {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
                  {!isManualEntry && initialData[key] === null && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                  {isRequired && (
                    <span className="text-grey-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  id={key}
                  type={key === "testDateTime" ? "datetime-local" : "number"}
                  step={key === "testDateTime" ? undefined : "0.1"}
                  value={formatValue(formData[key], key)}
                  required={isRequired}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={!isManualEntry && initialData[key] === null ? "Not detected" : ""}
                  className={!isManualEntry && initialData[key] === null ? "border-destructive" : ""}
                />
              </div>
            ))}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} 
          disabled={isDisabled()}
          >
            {isManualEntry ? "Save Data" : "Confirm Data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
