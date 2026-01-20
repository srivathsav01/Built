"use client";

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'


  export default function ProfilePage() {
    const { id } = useParams<{ id: string }>()
    return <h1>Profile slug: {id}</h1>
  }