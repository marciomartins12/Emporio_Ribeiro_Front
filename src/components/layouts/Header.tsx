
import { Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  return (
    <header className="border-b bg-white py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
        <h2 className="ml-4 text-lg font-medium">Sistema de Gestão</h2>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
