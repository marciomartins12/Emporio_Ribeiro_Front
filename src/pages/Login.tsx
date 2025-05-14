
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    const success = login(username, password);

    if (success) {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema do Empório Ribeiro.",
      });
      navigate("/");
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emporio-600 mb-2">Empório Ribeiro</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <p className="mt-2 text-gray-600">Sistema de PDV</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="emporio-input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="emporio-input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full emporio-btn-primary"
            >
              Entrar
            </Button>
          </div>
        </form>
        
        
      </div>
    </div>
  );
};

export default Login;