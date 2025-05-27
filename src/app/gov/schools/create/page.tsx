"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { CreateSchoolRequest } from "@/types/school-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GovernmentSidebar from "@/components/sidebarGovernment";
import Link from "next/link";

export default function CreateSchoolPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [formData, setFormData] = useState<CreateSchoolRequest>({
    name: "",
    npsn: "",
    school_id: "",
    password: "",
    address: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      if (
        !formData.name ||
        !formData.npsn ||
        !formData.school_id ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate NPSN format (8 digits)
      if (!/^\d{8}$/.test(formData.npsn)) {
        setError("NPSN must be exactly 8 digits");
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      await GovernmentAPI.createSchool(formData);
      router.push("/gov/schools");
    } catch (error) {
      console.error("Error creating school:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create school"
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
            href="/gov/schools"
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
          <h1 className="text-lg font-semibold">Create New School</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Add New School</h2>
              <p className="text-muted-foreground">
                Create a new school account in your province
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">School Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., SD Negeri 1 Jakarta"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="npsn">NPSN *</Label>
                      <Input
                        id="npsn"
                        name="npsn"
                        value={formData.npsn}
                        onChange={handleChange}
                        placeholder="8-digit NPSN"
                        maxLength={8}
                        pattern="\d{8}"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        National School Principal Number (8 digits)
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="school_id">School ID *</Label>
                      <Input
                        id="school_id"
                        name="school_id"
                        value={formData.school_id}
                        onChange={handleChange}
                        placeholder="e.g., school_001"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Unique identifier for login
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">School Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Complete school address"
                      rows={3}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Contact Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Principal or contact person name"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          placeholder="school@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Phone Number</Label>
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          type="tel"
                          value={formData.contact_phone}
                          onChange={handleChange}
                          placeholder="e.g., +62 21 1234567"
                        />
                      </div>
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
                          Creating School...
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
                          Create School
                        </>
                      )}
                    </Button>

                    <Link href="/gov/schools">
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
                <CardTitle className="text-lg">Important Information</CardTitle>
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
                    <p className="font-medium">School Login Credentials</p>
                    <p className="text-sm text-muted-foreground">
                      The school will use the School ID and password to log into
                      their portal
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
                    <p className="font-medium">NPSN Validation</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure the NPSN is correct as it&apos;s used for official
                      identification
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
                    <p className="font-medium">Password Security</p>
                    <p className="text-sm text-muted-foreground">
                      Schools can change their password after first login
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
