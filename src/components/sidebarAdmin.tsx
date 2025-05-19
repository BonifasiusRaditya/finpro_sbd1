// components/layout/Sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import logo from "@/asset/logo.png";
import Image from "next/image";
import QRCodeIcon from "@/components/ui/QRcode";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


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
            <Button variant="ghost" className={cn("w-full justify-start ", pathname === "/admin/report" && "bg-gray-200")}>
              Food Distribution Report
            </Button>

            <Button variant="ghost" className={cn("w-full justify-start ", pathname === "/admin/expenses" && "bg-gray-200")}>
              Expenses Tracker
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start", pathname === "/admin/food-distribution" && "bg-gray-200")}>
              Food Distribution Menu
            </Button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Button className="w-full justify-start gap-2 mt-4 mb-4">
            <QRCodeIcon className="h-4 w-4" />
              Scan QR Code
          </Button>
          <Card className="flex flex-col justify-center">
            <div className="ml-3 text-sm">
              <p>TianHD (089520234982)</p>
              <p className="text-muted-foreground">TianGamer@gmail.com</p>
            </div>
          </Card>x
        </div>
      </div>
    </div>
  );
}

