import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import eiktoLogoHero from "@/assets/Logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Email ou senha inválidos.");
    } else {
      if (!data.session && !session) {
        toast.error("Sessão não foi iniciada corretamente. Tente novamente.");
        return;
      }

      toast.success("Bem-vindo(a)!");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--ekt-blue))] via-[hsl(var(--ekt-blue))] to-[hsl(var(--ekt-green))] items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-5%] right-[-10%] h-[400px] w-[400px] rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-[-8%] left-[-8%] h-[350px] w-[350px] rounded-full bg-white/5 animate-float-medium" />
        <div className="absolute top-[40%] left-[15%] h-[120px] w-[120px] rounded-full bg-white/10 animate-float-fast" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_30%)]" />

        <div className="relative z-10 px-12 text-center animate-fade-in-up">
          <div className="mx-auto mb-8 flex w-fit justify-center rounded-[28px] border border-white/15 bg-white/10 px-10 py-6 shadow-2xl backdrop-blur-sm animate-hero-drift">
            <img src={eiktoLogoHero} alt="EKT" className="h-32 w-auto" />
          </div>
          <h2
            className="text-3xl font-bold text-white leading-tight text-balance"
            style={{ lineHeight: "1.15" }}
          >
            Banco de Talentos
          </h2>
          <p className="mt-3 text-white/80 text-base max-w-sm mx-auto">
            Gerencie e encontre os melhores candidatos para a sua equipe.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="rounded-[24px] bg-gradient-to-r from-[hsl(var(--ekt-blue))] to-[hsl(var(--ekt-green))] px-6 py-4 shadow-lg">
              <img src={eiktoLogoHero} alt="EKT" className="h-14 w-auto" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center lg:text-left">
            Entrar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center lg:text-left">
            Acesse o painel de gestão de talentos
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1.5"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
