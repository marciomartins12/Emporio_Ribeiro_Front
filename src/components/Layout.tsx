import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster } from 'react-hot-toast';

import { toast } from "@/hooks/use-toast";

import { 
  LogOut, 
  ShoppingCart, 
  Barcode, 
  Package, 
  FileText,
  Home
} from "lucide-react";

import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso.",
    });
    navigate("/login");
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated && location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // Don't show navigation on login page
  if (location.pathname === "/login") {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <Toaster />
      </div>
    );
  }

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-emporio-500 text-white"
      : "hover:bg-emporio-100 text-gray-700";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-emporio-600">Empório Ribeiro</h1>
          <p className="text-sm text-gray-500">Sistema de PDV</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`flex items-center p-3 rounded-md ${isActive("/")}`}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/pdv"
                className={`flex items-center p-3 rounded-md ${isActive("/pdv")}`}
              >
                <ShoppingCart className="mr-3 h-5 w-5" />
                PDV
              </Link>
            </li>
            <li>
              <Link
                to="/produtos"
                className={`flex items-center p-3 rounded-md ${isActive("/produtos")}`}
              >
                <Package className="mr-3 h-5 w-5" />
                Produtos
              </Link>
            </li>
            <li>
              <Link
                to="/vendas"
                className={`flex items-center p-3 rounded-md ${isActive("/vendas")}`}
              >
                <FileText className="mr-3 h-5 w-5" />
                Vendas
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
      
      {/* Adicionar o Toaster aqui */}
      <Toaster />
    </div>
  );
};

export default Layout;
