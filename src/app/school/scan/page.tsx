"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSchoolAuth } from "@/hooks/useSchoolAuth";
import { SchoolAPI } from "@/services/SchoolAPI";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/sidebarSchool";

interface TodayMenu {
  allocation_id: string;
  menu_id: string;
  menu_name: string;
  menu_description?: string;
  menu_date: string;
  price_per_portion: number;
  menu_image_url?: string;
  total_quantity: number;
  distributed_count: number;
  available_quantity: number;
  allocation_date: string;
}

interface ScanResult {
  reception_log: {
    id: string;
    received_at: string;
  };
  student: {
    id: string;
    name: string;
    student_number: string;
    class: string;
    grade: string;
  };
  menu: {
    name: string;
    description?: string;
    price_per_portion: number;
  };
  allocation: {
    id: string;
    date: string;
    total_quantity: number;
    distributed_count: number;
    remaining_quantity: number;
  };
}

export default function ScanPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSchoolAuth();
  const [todayMenus, setTodayMenus] = useState<TodayMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<TodayMenu | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/school/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayMenus();
    }
  }, [isAuthenticated]);

  const fetchTodayMenus = async () => {
    try {
      setIsLoadingMenus(true);
      const data = await SchoolAPI.getTodayMenus();
      setTodayMenus(data.menus);
    } catch (error) {
      console.error("Error fetching today's menus:", error);
      setError("Failed to load today's menus");
    } finally {
      setIsLoadingMenus(false);
    }
  };

  const startCamera = () => {
    if (!selectedMenu) {
      setError("Please select a menu first");
      return;
    }

    if (scannerRef.current) {
      return; // Camera already active
    }

    setError(null);
    setSuccess(null);

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
      async (decodedText) => {
        console.log("QR Code scanned:", decodedText);
        await processScan(decodedText);
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

  const processScan = async (qrCode: string) => {
    if (!selectedMenu) {
      setError("No menu selected");
      return;
    }

    try {
      setIsProcessingScan(true);
      setError(null);

      const result = await SchoolAPI.scanMeal({
        student_qr_code: qrCode,
        allocation_id: selectedMenu.allocation_id,
      });

      setScanResult(result);
      setSuccess(`Meal successfully claimed for ${result.student.name}`);

      // Refresh menu data to update available quantities
      await fetchTodayMenus();

      // Update selected menu with new data
      const updatedMenu = todayMenus.find(
        (m) => m.allocation_id === selectedMenu.allocation_id
      );
      if (updatedMenu) {
        setSelectedMenu({
          ...updatedMenu,
          distributed_count: result.allocation.distributed_count,
          available_quantity: result.allocation.remaining_quantity,
        });
      }
    } catch (error) {
      console.error("Error processing scan:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process scan"
      );
    } finally {
      setIsProcessingScan(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
    setSuccess(null);
    if (isCameraActive) {
      stopCamera();
    }
  };

  const selectMenu = (menu: TodayMenu) => {
    setSelectedMenu(menu);
    setError(null);
    setSuccess(null);
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
          <h1 className="text-lg font-semibold">Scan Student QR</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Today's Menus */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Available Menus</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a menu to start scanning student QR codes
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingMenus ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : todayMenus.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>No menus available for today</p>
                  <p className="text-sm">
                    Check back later or contact your administrator
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {todayMenus.map((menu) => (
                    <Card
                      key={menu.allocation_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedMenu?.allocation_id === menu.allocation_id
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => selectMenu(menu)}
                    >
                      <CardContent className="p-4">
                        {menu.menu_image_url && (
                          <img
                            src={menu.menu_image_url}
                            alt={menu.menu_name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-semibold text-lg mb-2">
                          {menu.menu_name}
                        </h3>
                        {menu.menu_description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {menu.menu_description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Price:</span>
                            <Badge variant="secondary">
                              Rp {menu.price_per_portion.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Available:
                            </span>
                            <Badge
                              variant={
                                menu.available_quantity > 0
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {menu.available_quantity} / {menu.total_quantity}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Distributed:
                            </span>
                            <span className="text-sm">
                              {menu.distributed_count}
                            </span>
                          </div>
                        </div>
                        {selectedMenu?.allocation_id === menu.allocation_id && (
                          <div className="mt-3 pt-3 border-t">
                            <Badge className="w-full justify-center">
                              Selected
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Scanner */}
          {selectedMenu && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Scanning for: <strong>{selectedMenu.menu_name}</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Controls */}
                <div className="flex justify-center gap-4">
                  {!isCameraActive && !scanResult && (
                    <Button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={selectedMenu.available_quantity <= 0}
                    >
                      {selectedMenu.available_quantity <= 0
                        ? "No Portions Available"
                        : "Start Scanning"}
                    </Button>
                  )}

                  {isCameraActive && (
                    <Button onClick={stopCamera} variant="destructive">
                      Stop Camera
                    </Button>
                  )}

                  {scanResult && (
                    <Button onClick={resetScan} variant="outline">
                      Scan Another
                    </Button>
                  )}
                </div>

                {/* Processing Indicator */}
                {isProcessingScan && (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    <span>Processing scan...</span>
                  </div>
                )}

                {/* Scan Result Display */}
                {scanResult && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">
                      ✅ Meal Claimed Successfully!
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Student:</span>
                        <span>{scanResult.student.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Student Number:</span>
                        <span>{scanResult.student.student_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Class:</span>
                        <span>{scanResult.student.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Menu:</span>
                        <span>{scanResult.menu.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>
                          {new Date(
                            scanResult.reception_log.received_at
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Remaining Portions:</span>
                        <span>{scanResult.allocation.remaining_quantity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Status */}
                {!isCameraActive && !scanResult && selectedMenu && (
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
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      Ready to scan student QR codes
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      QR codes should be in format: mbgku-{"{student_number}"}
                    </p>
                  </div>
                )}

                {/* QR Reader Container */}
                <div id="qr-reader" className="w-full" />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
