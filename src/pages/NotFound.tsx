
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Rota não encontrada:",
      location.pathname
    );
  }, [location.pathname]);

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emporio-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-emporio-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-lg text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button onClick={handleReturnHome} className="mx-auto">
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
