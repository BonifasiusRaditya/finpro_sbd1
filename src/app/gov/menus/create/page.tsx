"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { CreateMenuRequest } from "@/types/menu-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GovernmentSidebar from "@/components/sidebarGovernment";
import Link from "next/link";

export default function CreateMenuPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [formData, setFormData] = useState<CreateMenuRequest>({
    name: "",
    description: "",
    date: "",
    price_per_portion: 0,
    image_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price_per_portion" ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name || !formData.date || !formData.price_per_portion) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate date is not in the past
      const menuDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      menuDate.setHours(0, 0, 0, 0);

      if (menuDate < today) {
        setError("Menu date cannot be in the past");
        return;
      }

      // Validate price
      if (formData.price_per_portion <= 0) {
        setError("Price per portion must be greater than 0");
        return;
      }

      await GovernmentAPI.createMenu(formData);
      router.push("/gov/menus");
    } catch (error) {
      console.error("Error creating menu:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create menu"
      );
    } finally {
      setIsSubmitting(false);
    }
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
            href="/gov/menus"
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
          <h1 className="text-lg font-semibold">Create New Menu</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Create New Menu</h2>
              <p className="text-muted-foreground">
                Create a new meal menu for schools in your province
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Menu Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Menu Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Nasi Gudeg + Ayam + Sayur Bayam"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the menu ingredients and nutritional benefits"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date">Menu Date *</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Date when this menu will be served
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price_per_portion">
                          Price per Portion (IDR) *
                        </Label>
                        <Input
                          id="price_per_portion"
                          name="price_per_portion"
                          type="number"
                          value={formData.price_per_portion || ""}
                          onChange={handleChange}
                          placeholder="15000"
                          min="1"
                          step="100"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Cost per portion in Indonesian Rupiah
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL (Optional)</Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/menu-image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL to an image of the menu
                      </p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Menu...
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
                          Create Menu
                        </>
                      )}
                    </Button>

                    <Link href="/gov/menus">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Menu Guidelines</CardTitle>
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
                    <p className="font-medium">Nutritional Balance</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure menus include balanced nutrition with
                      carbohydrates, proteins, and vegetables
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
                    <p className="font-medium">Local Ingredients</p>
                    <p className="text-sm text-muted-foreground">
                      Prioritize local and seasonal ingredients to support local
                      economy
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
                    <p className="font-medium">Budget Consideration</p>
                    <p className="text-sm text-muted-foreground">
                      Keep pricing reasonable while maintaining quality and
                      nutrition standards
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
