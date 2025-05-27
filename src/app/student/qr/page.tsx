"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { StudentAPI } from "@/services/StudentAPI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QRCodeGenerator from "@/components/ui/QRCodeGenerator";
import Sidebar from "@/components/sidebarStudent";

export default function StudentQRPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useStudentAuth();
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/student/auth/login");
      return;
    }

    if (isAuthenticated && user) {
      checkTodayStatus();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const checkTodayStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const menusData = await StudentAPI.getAvailableMenus();
      setHasClaimedToday(menusData.has_claimed_today);
      setCanClaim(menusData.can_claim);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check meal status"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const qrValue = `mbgku-${user.student_number}`;
  const currentDate = new Date();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar user={user} />

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">QR Code for Meal Claim</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Your meal claim details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Student Number:
                    </span>
                    <span className="font-medium">{user.student_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Class:</span>
                    <span className="font-medium">{user.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Grade:</span>
                    <span className="font-medium">{user.grade}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formatDate(currentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(currentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge
                      variant={
                        hasClaimedToday
                          ? "secondary"
                          : canClaim
                          ? "default"
                          : "destructive"
                      }
                    >
                      {hasClaimedToday
                        ? "Already Claimed"
                        : canClaim
                        ? "Can Claim"
                        : "No Meals Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Claim QR Code</CardTitle>
              <CardDescription>
                {hasClaimedToday
                  ? "You have already claimed your meal for today. Come back tomorrow!"
                  : canClaim
                  ? "Show this QR code to your school staff to claim today's meal"
                  : "No meals are available for today"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {!hasClaimedToday && canClaim ? (
                  <>
                    {showQR ? (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <QRCodeGenerator
                            value={qrValue}
                            size={250}
                            className="shadow-lg"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">
                            QR Code Value:
                          </p>
                          <p className="font-mono text-lg font-bold text-green-600">
                            {qrValue}
                          </p>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• Show this QR code to school staff</p>
                          <p>• One meal per day limit</p>
                          <p>• QR code is valid for today only</p>
                        </div>
                        <Button
                          onClick={() => setShowQR(false)}
                          variant="outline"
                          className="mt-4"
                        >
                          Hide QR Code
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📱</div>
                            <p className="text-gray-500 font-medium">
                              QR Code Hidden
                            </p>
                            <p className="text-sm text-gray-400">
                              Click below to generate
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowQR(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                          size="lg"
                        >
                          Generate QR Code
                        </Button>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• Click to generate your meal claim QR code</p>
                          <p>• Format: mbgku-{user.student_number}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {hasClaimedToday ? "✅" : "❌"}
                        </div>
                        <p className="text-gray-500 font-medium">
                          {hasClaimedToday
                            ? "Already Claimed Today"
                            : "No Meals Available"}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {hasClaimedToday ? (
                        <>
                          <p>• You have claimed your meal for today</p>
                          <p>• Come back tomorrow for your next meal</p>
                          <p>• One meal per day limit</p>
                        </>
                      ) : (
                        <>
                          <p>• No menus are allocated for today</p>
                          <p>• Check with your school administration</p>
                          <p>• Try again later</p>
                        </>
                      )}
                    </div>
                    <Button
                      onClick={checkTodayStatus}
                      variant="outline"
                      className="mt-4"
                    >
                      Refresh Status
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
