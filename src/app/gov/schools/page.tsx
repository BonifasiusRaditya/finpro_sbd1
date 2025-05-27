"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { SchoolResponse } from "@/types/school-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import GovernmentSidebar from "@/components/sidebarGovernment";
import Link from "next/link";

export default function SchoolManagementPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/gov/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSchools();
    }
  }, [isAuthenticated]);

  const loadSchools = async () => {
    try {
      setIsLoadingSchools(true);
      setError("");
      const schoolsData = await GovernmentAPI.getSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load schools"
      );
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${schoolName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await GovernmentAPI.deleteSchool(schoolId);
      setSchools(schools.filter((school) => school.id !== schoolId));
    } catch (error) {
      console.error("Error deleting school:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete school"
      );
    }
  };

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.npsn.includes(searchTerm) ||
      school.school_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <GovernmentSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">School Management</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Schools in Your Province</h2>
              <p className="text-muted-foreground">
                Manage schools and their information
              </p>
            </div>
            <Link href="/gov/schools/create">
              <Button>
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
                Add New School
              </Button>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Schools
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schools.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registered schools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Schools
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
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
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schools.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Additions
                </CardTitle>
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    schools.filter((school) => {
                      const createdAt = new Date(school.created_at || "");
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdAt > weekAgo;
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Added this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>School Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search schools by name, NPSN, or school ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Button variant="outline" onClick={loadSchools}>
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {isLoadingSchools ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>NPSN</TableHead>
                        <TableHead>School ID</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchTerm
                              ? "No schools found matching your search."
                              : "No schools registered yet."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSchools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">
                                  {school.name}
                                </div>
                                {school.address && (
                                  <div className="text-sm text-muted-foreground">
                                    {school.address}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{school.npsn}</Badge>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {school.school_id}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {school.contact_person && (
                                  <div className="font-medium">
                                    {school.contact_person}
                                  </div>
                                )}
                                {school.contact_email && (
                                  <div className="text-muted-foreground">
                                    {school.contact_email}
                                  </div>
                                )}
                                {school.contact_phone && (
                                  <div className="text-muted-foreground">
                                    {school.contact_phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800"
                              >
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {school.created_at
                                ? new Date(
                                    school.created_at
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Link href={`/gov/schools/${school.id}`}>
                                  <Button variant="outline" size="sm">
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  </Button>
                                </Link>
                                <Link href={`/gov/schools/${school.id}/edit`}>
                                  <Button variant="outline" size="sm">
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
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteSchool(school.id, school.name)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
