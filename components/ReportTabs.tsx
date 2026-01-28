"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type Report = {
  id: string
  date: string
  mineral: number
  protein: number
  totalBodyWater: number
  weight: number
  bodyFatMass: number
  bodyFatPct: number
  skeletalMuscleMass: number
  bodyMassIndex: number
}

type Segment = {
  id: string
  segment: string
  leanMassKg: number | null
  fatMassKg: number | null
}

export default function ReportsTabs({ reports }: { reports: Report[] }) {
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id)
  const [segments, setSegments] = useState<Segment[] | null>(null)
  const [loadingSegments, setLoadingSegments] = useState(false)

  // Sort reports by date (oldest to newest)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const selectedReportIndex = sortedReports.findIndex(r => r.id === selectedReportId)
  const selectedReport = sortedReports[selectedReportIndex]
  const previousReport = selectedReportIndex > 0 
    ? sortedReports[selectedReportIndex - 1] 
    : null

  useEffect(() => {
    setSegments(null)
  }, [selectedReportId])

    async function fetchSegments() {
        if (!selectedReportId) return
        setLoadingSegments(true)
        try {
            const res = await fetch(`/api/report/segment/${selectedReportId}`)
            if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
            const data = await res.json()
            setSegments(data)
        } catch (err: any) {
            toast.error("Failed to Load the Segments", {
                description: err.message || "Unknown error",
            })
            setSegments(null);
        } finally {
            setLoadingSegments(false)
        }
    }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sortedReports.map((report, index) => (
          <button
            key={report.id}
            onClick={() => setSelectedReportId(report.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                selectedReportId === report.id
                  ? "bg-gray-300 text-black"
                  : "hover:bg-gray-200"
              }
            `}
          >
            {new Date(report.date).toLocaleDateString()}
          </button>
        ))}
      </div>

      <div className="bg-background rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 justify-center items-center flex">
          Body Composition
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Metric 
            label="Weight" 
            value={`${selectedReport?.weight} kg`}
            change={previousReport ? selectedReport.weight - previousReport.weight : undefined}
          />
          <Metric 
            label="BMI" 
            value={`${selectedReport?.bodyMassIndex}`}
            change={previousReport ? selectedReport.bodyMassIndex - previousReport.bodyMassIndex : undefined}
          />
          <Metric 
            label="Protein" 
            value={`${selectedReport?.protein} kg`}
            change={previousReport ? selectedReport.protein - previousReport.protein : undefined}
          />
          <Metric 
            label="Mineral" 
            value={`${selectedReport?.mineral} kg`}
            change={previousReport ? selectedReport.mineral - previousReport.mineral : undefined}
          />
          <Metric 
            label="Body Fat %" 
            value={`${selectedReport?.bodyFatPct}%`}
            change={previousReport ? selectedReport.bodyFatPct - previousReport.bodyFatPct : undefined}
          />
          <Metric 
            label="Fat Mass" 
            value={`${selectedReport?.bodyFatMass} kg`}
            change={previousReport ? selectedReport.bodyFatMass - previousReport.bodyFatMass : undefined}
          />
          <Metric 
            label="Muscle Mass" 
            value={`${selectedReport?.skeletalMuscleMass} kg`}
            change={previousReport ? selectedReport.skeletalMuscleMass - previousReport.skeletalMuscleMass : undefined}
          />
          <Metric 
            label="Water" 
            value={`${selectedReport?.totalBodyWater} L`}
            change={previousReport ? selectedReport.totalBodyWater - previousReport.totalBodyWater : undefined}
          />
        </div>

        {!segments && <div className="flex justify-center"><button
            onClick={fetchSegments}
            className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 justify-center items-center flex"
          >
            {loadingSegments ? "Loading..." : "Get Segment Split"}
        </button>
        </div>
}

        {segments && (
            <>
            {segments.length==0 && <div className="text-gray-500 text-md justify-center items-center flex mt-3"> No Segments found for the above report </div> }
            <div className="mt-6 grid grid-cols-2 gap-4">
              {segments.map(seg => (
                <div
                  key={seg.id}
                  className="border rounded-xl p-4 shadow-sm bg-background"
                >
                  <h3 className="font-semibold">
                    {formatSegment(seg.segment)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lean Mass: {seg.leanMassKg ?? "-"} kg
                  </p>
                  <p className="text-sm text-gray-600">
                    Fat Mass: {seg.fatMassKg ?? "-"} kg
                  </p>
                </div>
              ))}
            </div>
            </>
          )}
      </div>
    </div>
  )
}

function Metric({ label, value, change }: { label: string; value: string | number; change?: number }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '•'} {Math.abs(change).toFixed(2)}
        </p>
      )}
    </div>
  )
}

function formatSegment(segment: string) {
  return segment
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}