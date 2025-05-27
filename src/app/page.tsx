"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">MBGku</h1>
              <span className="ml-3 text-sm text-gray-600">
                Makan Bergizi Gratis
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to MBGku
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            The digital platform for Indonesia&apos;s Free Nutritious Meals
            program by President Prabowo. Choose your portal below to access the
            system.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Student Portal */}
          <Link href="/student/auth/login">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-t-4 border-green-500 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Student Portal
                </h3>
                <p className="text-gray-600 mb-4">
                  Access your daily meal QR codes and track your nutrition
                  intake
                </p>
                <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                  Login as Student
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* School Portal */}
          <Link href="/school/auth/login">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-t-4 border-blue-500 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  School Portal
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage student meals, scan QR codes, and track distribution
                </p>
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  Login as School
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Government Portal */}
          <Link href="/gov/auth/login">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-t-4 border-purple-500 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Government Portal
                </h3>
                <p className="text-gray-600 mb-4">
                  Provincial oversight, school management, and program analytics
                </p>
                <div className="inline-flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  Login as Government
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Program Info */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            About the Program
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                Nutritious
              </div>
              <p className="text-gray-600">
                Balanced meals designed by nutrition experts for growing
                students
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Free</div>
              <p className="text-gray-600">
                Completely free meals for all eligible students across Indonesia
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                Digital
              </div>
              <p className="text-gray-600">
                Modern QR-code system for efficient and transparent distribution
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            © 2024 MBGku - Makan Bergizi Gratis Program by President Prabowo
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Ensuring every Indonesian student receives nutritious meals
          </p>
        </div>
      </footer>
    </div>
  );
}
