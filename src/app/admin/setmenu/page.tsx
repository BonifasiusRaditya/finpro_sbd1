import React from "react";
import Sidebar from '@/components/sidebarAdmin';

export default function SetMenuPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Set Food Menu</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="space-y-4">

            <form className="bg-white rounded-lg shadow px-4 py-5 space-y-4 w-full">
                <div>
                    <h1 className="text-lg mb-7 font-bold text-gray-800 mb-2 flex justify-center">
                        Edit Menu
                    </h1>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                    <option value="">Pilih Hari</option>
                    <option value="senin">Senin</option>
                    <option value="selasa">Selasa</option>
                    <option value="rabu">Rabu</option>
                    <option value="kamis">Kamis</option>
                    <option value="jumat">Jumat</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu Sarapan
                </label>
                <input
                    type="text"
                    placeholder="Contoh: Nasi Goreng, Telur Rebus"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu Makan Siang
                </label>
                <input
                    type="text"
                    placeholder="Contoh: Nasi + Ayam + Sayur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu Camilan
                </label>
                <input
                    type="text"
                    placeholder="Contoh: Pisang Rebus, Susu UHT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                </div>

                <div className="pt-2">
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                    Save
                </button>
                </div>
            </form>
            </div>

        </main>
      </div>
    </div>
  );
}