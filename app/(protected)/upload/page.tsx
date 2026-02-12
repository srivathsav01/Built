"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/lib/context/LoadingContext";
import { InBodyData } from "@/lib/inbody";
import { useState, useTransition } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();

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
        console.log("Extracted InBody Data:", inBodyData);
      }
      catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error parsing file:", message);
      }
      finally{
        setIsLoading(false);
        setFile(null);
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
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isPending}
            />
            <div className="flex items-center gap-2 rounded-md p-1 mb-1">
              <span className="text-xl">⚠️</span>
              <span className="text-sm text-yellow-300">Segment split recognition yet to be implemented</span>
            </div>
            
            <Button
              onClick={submit}
              disabled={!file || isPending}
              className="p-2 cursor-pointer w-full mt-4"
            >
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}