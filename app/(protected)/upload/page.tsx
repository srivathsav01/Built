"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InBodyDataValidationDialog } from "@/components/InBodyDataValidationDialog";
import { useLoading } from "@/lib/context/LoadingContext";
import { InBodyData } from "@/lib/inbody";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const EMPTY_INBODY_DATA: InBodyData = {
  totalBodyWater: null,
  protein: null,
  mineral: null,
  bodyFatMass: null,
  skeletalMuscleMass: null,
  bmi: null,
  weight: null,
  height: null,
  age: null,
  pbf: null,
  testDateTime: null,
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedData, setExtractedData] = useState<InBodyData | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const handleConfirmData = async (validatedData: InBodyData) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save report");
      toast.success("Report saved successfully", { position: "top-center" });
      console.log("Report saved successfully:", json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error saving report:", message);
      toast.error("Failed to save the report", {
        description: message,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
      setExtractedData(null);
      setIsManualEntry(false);
    }
  };

  const openManualEntry = () => {
    setExtractedData(EMPTY_INBODY_DATA);
    setIsManualEntry(true);
    setShowValidationDialog(true);
  };

  const submit = async () => {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);
      try {
        setIsLoading(true);
        const res = await fetch("/api/inbody/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        
        const inBodyData: InBodyData = json.data;
        setExtractedData(inBodyData);
        setShowValidationDialog(true);
      }
      catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error parsing file:", message);
      }
      finally{
        setIsLoading(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="relative flex flex-col h-full items-center justify-center gap-6">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium">Uploading...</p>
          </div>
        </div>
      )}
      <div className={isPending ? "blur-sm pointer-events-none" : ""}>
        <h1 className="text-xl font-bold mb-3 flex items-center justify-center">Upload InBody Report</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-md">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isPending}
            />
            <div className="flex items-center gap-2 rounded-md p-1 mb-1">
              <span className="text-xl">⚠️</span>
              <span className="text-sm text-yellow-500">Segment split recognition yet to be implemented</span>
            </div>
            
            <Button
              onClick={submit}
              disabled={!file || isPending}
              className="p-2 cursor-pointer w-full mt-4"
            >
              {isPending ? "Uploading..." : "Upload"}
            </Button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <Button
              onClick={openManualEntry}
              variant="outline"
              disabled={isPending}
              className="p-2 cursor-pointer w-full"
            >
              Enter Values Manually
            </Button>
          </div>
        </div>
      </div>

      {extractedData && (
        <InBodyDataValidationDialog
          open={showValidationDialog}
          onOpenChange={setShowValidationDialog}
          initialData={extractedData}
          onConfirm={handleConfirmData}
          isManualEntry={isManualEntry}
        />
      )}
    </div>
  );
}