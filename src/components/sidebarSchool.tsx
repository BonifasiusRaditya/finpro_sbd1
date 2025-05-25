"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import logo from "@/asset/logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Sidebar() {
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
            height={40}/>
          <h1 className="font-semibold">Makan Bergizi Gratis</h1>
        </div>

        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link href="/school/monitoring">
              <Button className={cn("w-full justify-start px-4 py-2 text-sm font-medium transition-colors", 
                pathname === "/school/monitoring" ? "bg-gray-200 text-black hover:bg-gray-200": "bg-gray-50 text-gray-700 hover:bg-gray-100")}>
                Student Monitoring
              </Button>
            </Link>

            <Link href="/school/foodmenu">
              <Button className={cn("w-full justify-start px-4 py-2 text-sm font-medium transition-colors", 
                pathname === "/school/foodmenu" ? "bg-gray-200 text-black hover:bg-gray-200": "bg-gray-50 text-gray-700 hover:bg-gray-100")}>
                Food Menu List
              </Button>
            </Link>
            
            <Link href="/school/scan">
              <Button className={cn("w-full justify-start px-4 py-2 text-sm font-medium transition-colors", 
                pathname === "/school/scan" ? "bg-gray-200 text-black hover:bg-gray-200": "bg-gray-50 text-gray-700 hover:bg-gray-100")}>
                Scan QR Code
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Link href="/school/add" className="bg-black text-white rounded-full h-10 font-bold border w-full justify-center items-center flex gap-2 mt-4 mb-4">
              Create an Account
          </Link>
          <Card className="flex flex-col justify-center">
            <div className="ml-3 text-sm">
              <p>TianHD (089520234982)</p>
              <p className="text-muted-foreground">TianGamer@gmail.com</p>
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

