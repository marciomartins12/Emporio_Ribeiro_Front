
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { SaleProvider } from "@/context/SaleContext";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PDV from "./pages/PDV";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductProvider>
        <SaleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/pdv" element={<PDV />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/vendas" element={<Sales />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SaleProvider>
      </ProductProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
