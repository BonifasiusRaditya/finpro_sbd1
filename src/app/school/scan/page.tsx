"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSchoolAuth } from "@/hooks/useSchoolAuth";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebarSchool";

export default function ScanPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSchoolAuth();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/school/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  const startCamera = () => {
    if (scannerRef.current) {
      return; // Camera already active
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        console.log("QR Code scanned:", decodedText);
        setScanResult(decodedText);
        stopCamera();
      },
      (errorMessage) => {
        console.warn("QR Code scan error:", errorMessage);
      }
    );

    setIsCameraActive(true);
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .then(() => {
          scannerRef.current = null;
          setIsCameraActive(false);
        })
        .catch((error) => console.error("Failed to clear scanner", error));
    }
  };

  const resetScan = () => {
    setScanResult(null);
    if (isCameraActive) {
      stopCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
              <CardTitle className="flex justify-center items-center font-bold">
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera Controls */}
              <div className="flex justify-center gap-4">
                {!isCameraActive && !scanResult && (
                  <Button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Camera
                  </Button>
                )}

                {isCameraActive && (
                  <Button onClick={stopCamera} variant="destructive">
                    Stop Camera
                  </Button>
                )}

                {scanResult && (
                  <Button onClick={resetScan} variant="outline">
                    Scan Again
                  </Button>
                )}
              </div>

              {/* Scan Result Display */}
              {scanResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    QR Code Scanned Successfully!
                  </h3>
                  <p className="text-green-700 break-all">{scanResult}</p>
                </div>
              )}

              {/* Camera Status */}
              {!isCameraActive && !scanResult && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    Click &quot;Start Camera&quot; to begin scanning QR codes
                  </p>
                </div>
              )}

              {/* QR Reader Container */}
              <div id="qr-reader" className="w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
