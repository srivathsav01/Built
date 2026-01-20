"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = async () => {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/inbody/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
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
          <Input
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isPending}
          />
          <Button 
            onClick={submit} 
            disabled={!file || isPending} 
            className="p-2 cursor-pointer"
          >
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}