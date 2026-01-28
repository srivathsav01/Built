"use client";

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'
import { toast } from "sonner"
import { useLoading } from "@/lib/context/LoadingContext";
import ReportsTabs from "@/components/ReportTabs";

  export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profileData, setProfileData] = useState<any>(null);
    const {setIsLoading} = useLoading();
    useEffect(() => {
      if (!id) return;
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/report`);
          if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
          const data = await res.json();
          setProfileData(data);
        } catch (err: any) {
          toast.error("Failed to Load the Profile", {
            description: err.message || "Unknown error",
          })
          setProfileData(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }, [id]);

    return (
      <div>
        <h1 className="text-xl font-semibold justify-center flex items-center">Profile</h1>
        { profileData && <ReportsTabs reports={profileData} /> }
      </div>
    );
  }