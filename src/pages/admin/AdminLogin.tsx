import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any admin exists
    const check = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .limit(1);
      setIsSetup(!data || data.length === 0);
      setCheckingSetup(false);
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSetup) {
      // Create first admin
      const { error } = await signUp(email, password, "Admin");
      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        setLoading(false);
        return;
      }

      // Wait a moment for the user to be created, then sign in
      await new Promise((r) => setTimeout(r, 1000));
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        toast.error("Conta criada, mas erro ao entrar. Tente fazer login.");
        setIsSetup(false);
        setLoading(false);
        return;
      }

      // Get the user and assign admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
      }

      toast.success("Conta admin criada com sucesso!");
      navigate("/admin");
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error("Credenciais inválidas");
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSetup ? "Criar Admin" : "Admin Login"}
          </CardTitle>
          {isSetup && (
            <CardDescription>
              Nenhum administrador encontrado. Crie a primeira conta admin.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isSetup ? "Criando..." : "Entrando..."
                : isSetup ? "Criar conta admin" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
