'use client'

import HumanModel3D from "@/components/HumanModel3D";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";

type Report = {
  id: string
  userId: string
  date: string
  mineral: number
  protein: number
  totalBodyWater: number
  weight: number
  bodyFatMass: number
  bodyFatPct: number
  skeletalMuscleMass: number
  bodyMassIndex: number
  createdAt: string
}

export default function Home() {
  const user = useCurrentUser();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/report')
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setReport(data[data.length - 1]);
          }
        })
        .catch(err => console.error('Error fetching report:', err))
    }
  }, [user]);

  return (
    <div className="bg-linear-to-b from-background via-background to-background flex items-center justify-center px-6 h-full">
      <div className="relative flex flex-col items-center justify-center w-full max-w-6xl space-y-8">
        {user && report ? (
          <HumanModel3D 
            metrics={[
              { label: "Weight", value: `${report.weight} kg` },
              { label: "BMI", value: report.bodyMassIndex.toFixed(1) },
              { label: "Body Fat", value: `${report.bodyFatPct.toFixed(1)}%` }
            ]}
          />
        ) : (
          <HumanModel3D />
        )}

        {!user && (
          <div className="space-y-3 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-primary to-foreground">
                built.
              </span>
            </h1>
            <p
              className="
                mx-auto
                w-full
                max-w-[90%]
                sm:max-w-md
                md:max-w-lg
                lg:max-w-xl
                xl:max-w-2xl

                text-sm
                sm:text-base
                md:text-lg
                lg:text-xl

                leading-relaxed
                text-muted-foreground
              "
            >
              A modern fitness companion to track, visualize, and understand your body
              composition as you build your strongest self.
            </p>
          </div>
        )}

        {user && (
          <div className="space-y-3 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-primary to-foreground">
                Welcome back!
              </span>
            </h1>
            {!report && (
              <p className="text-muted-foreground">
                Upload your first report to see your body composition data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
