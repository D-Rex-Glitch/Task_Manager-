"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/tasks");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <div className="container">Loading...</div>;
}
