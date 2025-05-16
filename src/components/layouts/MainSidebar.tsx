
import { NavLink } from "react-router-dom";
import { ShoppingCart, Package, Calendar, BarChart2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: BarChart2,
  },
  {
    title: "Produtos",
    path: "/produtos",
    icon: Package,
  },
  {
    title: "PDV",
    path: "/pdv",
    icon: ShoppingCart,
  },
  {
    title: "Histórico de Vendas",
    path: "/vendas",
    icon: Calendar,
  },
];

const MainSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6">
          <h1 className="heading-lg text-emporio-primary">Empório Ribeiro</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        isActive ? "text-primary font-medium" : "text-foreground hover:text-primary"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default MainSidebar;
