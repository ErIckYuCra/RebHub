import { Navbar } from '@/components/navigation/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
