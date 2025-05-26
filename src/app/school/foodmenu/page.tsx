"use Admin";
import Sidebar from '@/components/sidebarSchool';

export default function HomePage() {


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">List Food Menu</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* table makanannya nya yan */}

        </main>
      </div>
    </div>
  );
}