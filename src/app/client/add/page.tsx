"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  fullName: string;
  birthDate: string;
  province: string;
  city: string;
  nik: string;
  gender: string;
}

export default function AddProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    province: '',
    city: '',
    nik: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to create profile
    setTimeout(() => {
      console.log('Profile data:', formData);
      setIsLoading(false);
      router.push('/client/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link href="/client/home" className="p-2 rounded-full hover:bg-gray-100">
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
          </Link>
          <h1 className="text-xl font-semibold ml-4">Buat Profil Anak Anda</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              required
              value={formData.birthDate}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
              Tempat Tinggal <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="province"
                name="province"
                required
                value={formData.province}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled>Pilih Provinsi</option>
                <option value="jawa_barat">Jawa Barat</option>
                <option value="jawa_tengah">Jawa Tengah</option>
                <option value="jawa_timur">Jawa Timur</option>
                <option value="dki_jakarta">DKI Jakarta</option>
              </select>
              <select
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled>Pilih Kota</option>
                <option value="jakarta">Jakarta</option>
                <option value="bandung">Bandung</option>
                <option value="semarang">Semarang</option>
                <option value="surabaya">Surabaya</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">
              NIK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nik"
              name="nik"
              required
              value={formData.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK"
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="laki">Laki-laki</option>
              <option value="perempuan">Perempuan</option>
            </select>
          </div>

          <div className="pt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              {isLoading ? 'Memproses...' : 'Buat Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}