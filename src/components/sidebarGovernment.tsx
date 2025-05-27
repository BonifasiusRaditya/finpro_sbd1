"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import Image from "next/image";
import logo from "@/asset/logo.png";

export default function GovernmentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useGovernmentAuth();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/gov/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Image
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full"
              width={40}
              height={40}
            />
            <span className="text-lg">Government Portal</span>
          </Link>
        </div>

        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link href="/gov/dashboard">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/gov/dashboard"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                  />
                </svg>
                Dashboard
              </Button>
            </Link>

            <Link href="/gov/schools">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/gov/schools"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                School Management
              </Button>
            </Link>

            <Link href="/gov/menus">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/gov/menus"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Menu Management
              </Button>
            </Link>

            <Link href="/gov/allocations">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/gov/allocations"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Menu Allocation
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-purple-50 rounded-lg p-3 mb-3">
            <div className="text-sm font-medium text-purple-900">
              {user?.province || "Province"}
            </div>
            <div className="text-xs text-purple-600">Government Portal</div>
          </div>

          <Button onClick={logout} variant="outline" className="w-full text-sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
