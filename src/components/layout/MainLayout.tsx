import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border bg-card flex items-center px-4 sticky top-0 z-10">
              <SidebarTrigger />
            </header>
            <main className="flex-1 p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};
