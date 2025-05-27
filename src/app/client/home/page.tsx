"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Anak 1', age: '12 tahun' },
    { id: 2, name: 'Anak 2', age: '8 tahun' },
    { id: 3, name: 'Anak 3', age: '5 tahun' }
  ]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 min-h-[70vh]">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold ml-4">Pilih Profil Anak</h1>
          <button className="ml-auto p-2 rounded-full hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Existing profiles */}
          {profiles.map(profile => (
            <div key={profile.id} className="relative border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-green-400">
              <button className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center mb-2 transition-all duration-300 hover:bg-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:scale-110"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="font-medium transition-all duration-300 hover:text-green-600">{profile.name}</span>
              <span className="text-xs text-gray-500 transition-all duration-300">{profile.age}</span>
            </div>
          ))}

          {/* Add new profile */}
          <Link href="/client/add" className="border border-dashed border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-blue-400">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 transition-all duration-300 hover:bg-blue-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="lightblue"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="font-medium text-blue-500 transition-all duration-300 hover:text-blue-600">Tambah Profil Anak</span>
            <span className="text-xs text-gray-400 text-center">Minimal profil berusia 1 tahun</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Icons (you should import these from your icon library)
function QrCodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}