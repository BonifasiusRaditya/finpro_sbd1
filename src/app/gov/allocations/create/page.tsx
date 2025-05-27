"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { CreateMenuAllocationRequest } from "@/types/menu-types";
import { MenuResponse } from "@/types/menu-types";
import { SchoolResponse } from "@/types/school-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GovernmentSidebar from "@/components/sidebarGovernment";
import Link from "next/link";

export default function CreateAllocationPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [formData, setFormData] = useState<CreateMenuAllocationRequest>({
    school_id: "",
    menu_id: "",
    quantity: 0,
    date: "",
  });
  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [menus, setMenus] = useState<MenuResponse[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/gov/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [schoolsData, menusData] = await Promise.all([
        GovernmentAPI.getSchools(),
        GovernmentAPI.getMenus({ limit: 100 }), // Get more menus for selection
      ]);
      setSchools(schoolsData);
      setMenus(menusData.menus);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load schools and menus");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update selected menu when menu_id changes
    if (name === "menu_id") {
      const menu = menus.find((m) => m.id === value);
      setSelectedMenu(menu || null);
    }

    // Clear error when user makes changes
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (
        !formData.school_id ||
        !formData.menu_id ||
        !formData.quantity ||
        !formData.date
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate date is not in the past
      const allocationDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      allocationDate.setHours(0, 0, 0, 0);

      if (allocationDate < today) {
        setError("Allocation date cannot be in the past");
        return;
      }

      // Validate quantity
      if (formData.quantity <= 0) {
        setError("Quantity must be greater than 0");
        return;
      }

      await GovernmentAPI.createMenuAllocation(formData);
      router.push("/gov/allocations");
    } catch (error) {
      console.error("Error creating allocation:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create allocation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalValue = () => {
    if (selectedMenu && formData.quantity) {
      return selectedMenu.price_per_portion * formData.quantity;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/gov/auth/login");
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <GovernmentSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <Link
            href="/gov/allocations"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Create Menu Allocation</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Create Menu Allocation</h2>
              <p className="text-muted-foreground">
                Allocate a menu to a school with specific quantity and date
              </p>
            </div>

            {isLoadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Allocation Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                      </div>
                    )}

                    {/* School Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="school_id">Select School *</Label>
                      <Select
                        value={formData.school_id}
                        onValueChange={(value: string) =>
                          handleChange("school_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {school.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  NPSN: {school.npsn}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {schools.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No schools available. Please create schools first.
                        </p>
                      )}
                    </div>

                    {/* Menu Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="menu_id">Select Menu *</Label>
                      <Select
                        value={formData.menu_id}
                        onValueChange={(value: string) =>
                          handleChange("menu_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a menu" />
                        </SelectTrigger>
                        <SelectContent>
                          {menus.map((menu) => (
                            <SelectItem key={menu.id} value={menu.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{menu.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(menu.date).toLocaleDateString(
                                    "id-ID"
                                  )}{" "}
                                  - {formatCurrency(menu.price_per_portion)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {menus.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No menus available. Please create menus first.
                        </p>
                      )}
                    </div>

                    {/* Selected Menu Details */}
                    {selectedMenu && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Selected Menu Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {selectedMenu.name}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(selectedMenu.date).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                          <p>
                            <span className="font-medium">
                              Price per Portion:
                            </span>{" "}
                            {formatCurrency(selectedMenu.price_per_portion)}
                          </p>
                          {selectedMenu.description && (
                            <p>
                              <span className="font-medium">Description:</span>{" "}
                              {selectedMenu.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quantity and Date */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity (Portions) *</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={formData.quantity || ""}
                          onChange={(e) =>
                            handleChange(
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="150"
                          min="1"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of portions to allocate
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Allocation Date *</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Date when menu will be served
                        </p>
                      </div>
                    </div>

                    {/* Total Value Calculation */}
                    {getTotalValue() > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Allocation Summary
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Quantity:</span>{" "}
                            {formData.quantity.toLocaleString()} portions
                          </p>
                          <p>
                            <span className="font-medium">
                              Price per Portion:
                            </span>{" "}
                            {formatCurrency(
                              selectedMenu?.price_per_portion || 0
                            )}
                          </p>
                          <p className="text-lg font-bold text-green-900">
                            <span className="font-medium">Total Value:</span>{" "}
                            {formatCurrency(getTotalValue())}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          schools.length === 0 ||
                          menus.length === 0
                        }
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Allocation...
                          </>
                        ) : (
                          <>
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Create Allocation
                          </>
                        )}
                      </Button>

                      <Link href="/gov/allocations">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Allocation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Student Count Consideration</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure the quantity matches the expected number of
                      students who will receive meals
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Date Coordination</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinate with schools to ensure they can prepare and
                      serve on the allocated date
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-orange-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Budget Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      Monitor total allocation values to stay within budget
                      limits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
