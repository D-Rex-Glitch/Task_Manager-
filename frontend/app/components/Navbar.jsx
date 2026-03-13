"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getRole, getToken, getUserName } from "../../lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [authState, setAuthState] = useState({ token: null, userName: null, role: null, ready: false });
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setAuthState({
      token: getToken(),
      userName: getUserName(),
      role: getRole(),
      ready: true
    });
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">TaskFlow</Link>
        {!isAuthPage && (
          <nav className="site-nav">
            {authState.ready && authState.token ? (
              <>
                <Link href="/tasks" className={pathname === "/tasks" ? "active" : ""}>Tasks</Link>
                <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>Profile</Link>
                {authState.role === "ADMIN" && (
                  <Link href="/users" className={pathname === "/users" ? "active" : ""}>Users</Link>
                )}
                <span className="user-pill">{authState.userName || "User"}</span>
                <Link href="/logout">Logout</Link>
              </>
            ) : (
              <>
                <Link href="/login" className={pathname === "/login" ? "active" : ""}>Login</Link>
                <Link href="/register" className={pathname === "/register" ? "active" : ""}>Register</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
