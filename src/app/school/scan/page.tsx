"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Sidebar from '@/components/sidebarSchool';

export default function ScanPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    }, false);

    scanner.render(
      (decodedText, decodedResult) => {
        console.log("QR Code scanned:", decodedText);
        alert(`QR Code: ${decodedText}`);
        scanner.clear();
      },
      (errorMessage) => { console.warn("QR Code scan error:", errorMessage); }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Scan QR</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-center items-center font-bold ">QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="qr-reader" className="w-full" />
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
