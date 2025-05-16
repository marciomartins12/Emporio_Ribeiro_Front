
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainSidebar from "./MainSidebar";
import Header from "./Header";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-emporio-background">
        <MainSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
