import { checkAuth } from '@/lib/auth/utils';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Sidebar, { SidebarToggle } from '@/components/Sidebar';
import { SidebarProvider } from '@/lib/hooks/useSidebar';
import { getUserAuth } from '@/lib/auth/utils';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();
  const session = await getUserAuth();

  return (
    <SidebarProvider>
      <main>
        <div className="flex h-screen">
          <Sidebar session={session} />
          <main className="flex-1 md:p-8 pt-2 p-8 overflow-y-auto">
            <div className="flex items-center gap-4 mb-4">
              <SidebarToggle />
              <Navbar />
            </div>
            {children}
          </main>
        </div>
      </main>
      <Toaster richColors />
    </SidebarProvider>
  );
}
