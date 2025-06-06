"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/asset/logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { StudentUser } from "@/hooks/useStudentAuth";

export default function Sidebar({ user }: { user: StudentUser }) {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <Image
            src={logo}
            alt="Logo"
            className="h-10 w-10 rounded-full"
            width={40}
            height={40}
          />
          <h1 className="font-semibold">Makan Bergizi Gratis</h1>
        </div>

        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link href="/student/home">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/student/home"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                Home
              </Button>
            </Link>
            <Link href="/student/qr">
              <Button
                className={cn(
                  "w-full justify-start px-4 py-2 text-sm font-medium transition-colors",
                  pathname === "/student/qr"
                    ? "bg-gray-200 text-black hover:bg-gray-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                Scan QR Code
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Card className="flex flex-col justify-center">
            <div className="ml-3 text-sm">
              <p>
                {user.name} ({user.student_number})
              </p>
              <p className="text-muted-foreground">
                {user.class} {user.grade}
              </p>
            </div>
          </Card>

          <Link href="/login">
            <Card className="mt-1 flex flex-col py-2 bg-red-500 justify-center hover:bg-red-400 transition-colors">
              <div className="flex justify-center text-sm">
                <p className="font-bold text-white">logout</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
