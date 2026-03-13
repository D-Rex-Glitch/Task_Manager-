"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "../../lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuth();
    router.replace("/login");
  }, [router]);

  return <div className="container">Signing you out...</div>;
}
