import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateTable, type Candidate } from "@/components/CandidateTable";
import { CandidateModal } from "@/components/CandidateModal";
import { AddCandidateDialog } from "@/components/AddCandidateDialog";
import {
  Search,
  MapPin,
  LogOut,
  Users,
  Briefcase,
  FileText,
  ClipboardList,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import eiktoLogoHero from "@/assets/Logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const {
    data: candidates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidatesApi.list(),
    enabled: !authLoading && !!user,
  });

  const queryErrorMessage =
    error instanceof Error
      ? error.message
      : "Não foi possível carregar os candidatos.";

  const cities = useMemo(() => {
    const set = new Set(
      candidates.map((c) => c.city).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [candidates]);

  const stats = useMemo(() => {
    const totalCandidates = candidates.length;
    const totalCities = new Set(candidates.map((c) => c.city).filter(Boolean))
      .size;
    const totalPositions = new Set(
      candidates.map((c) => c.position).filter(Boolean),
    ).size;
    const totalWithResume = candidates.filter((c) => c.resume_url).length;
    return { totalCandidates, totalCities, totalPositions, totalWithResume };
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        !search || c.full_name.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "all" || c.city === cityFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesFavorite = !favoriteFilter || c.is_favorite;
      return matchesSearch && matchesCity && matchesStatus && matchesFavorite;
    });
  }, [candidates, search, cityFilter, statusFilter, favoriteFilter]);

  const handleDelete = async (id: string) => {
    try {
      await candidatesApi.delete(id);
      toast.success("Candidato excluído.");
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    } catch {
      toast.error("Erro ao excluir candidato.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--ekt-blue-light))_42%,hsl(var(--background)))]">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-[hsl(var(--ekt-blue))] via-[hsl(var(--ekt-blue))] to-[hsl(var(--ekt-green))] text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_34%)]" />
        <div className="absolute right-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-white/10 blur-2xl animate-float-slow" />
        <div className="absolute bottom-[-7rem] left-[-3rem] h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float-medium" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-5 flex w-fit items-center justify-center rounded-[28px] border border-white/15 bg-white/10 px-10 py-6 shadow-2xl backdrop-blur-sm">
              <img src={eiktoLogoHero} alt="EKT Logo" className="h-28 w-auto" />
            </div>
            <h1 className="text-3xl font-bold leading-tight text-balance sm:text-4xl">
              Banco de Talentos
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Centralize currículos, acompanhe favoritos e organize o pipeline
              de contratação com a mesma comunicação visual da tela de login.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                className="h-11 border border-white/10 bg-white/10 px-5 text-white shadow-xl backdrop-blur-sm hover:bg-white/15 hover:text-white"
                onClick={() => navigate("/reports")}
              >
                <ClipboardList className="h-4 w-4" />
                Relatórios
              </Button>
              <AddCandidateDialog
                onAdded={() =>
                  queryClient.invalidateQueries({ queryKey: ["candidates"] })
                }
                triggerClassName="h-11 border border-white/10 bg-white/10 px-5 text-white shadow-xl backdrop-blur-sm hover:bg-white/15 hover:text-white"
              />
              <Button
                variant="ghost"
                className="h-11 border border-white/10 bg-white/10 px-5 text-white shadow-xl backdrop-blur-sm hover:bg-white/15 hover:text-white"
                onClick={signOut}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[26rem]">
            <Card className="border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-white/15 p-2.5">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                  <p className="text-xs text-white/70">Candidatos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-white/15 p-2.5">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCities}</p>
                  <p className="text-xs text-white/70">Cidades</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-white/15 p-2.5">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPositions}</p>
                  <p className="text-xs text-white/70">Setores</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-white/15 p-2.5">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWithResume}</p>
                  <p className="text-xs text-white/70">Currículos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-2">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/60 p-4 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border-white/70 bg-white/75 pl-9 shadow-sm"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-11 w-full border-white/70 bg-white/75 shadow-sm sm:w-44">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full border-white/70 bg-white/75 shadow-sm sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="em_processo">Em processo</SelectItem>
              <SelectItem value="contratado">Contratado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className={`h-11 w-11 border shadow-sm backdrop-blur-sm ${
              favoriteFilter
                ? "border-[hsl(var(--ekt-blue))]/20 bg-[hsl(var(--ekt-blue))] text-white hover:bg-[hsl(var(--ekt-blue))]/90 hover:text-white"
                : "border-white/70 bg-white/75 text-foreground hover:bg-white"
            }`}
            onClick={() => setFavoriteFilter(!favoriteFilter)}
            title="Apenas favoritos"
          >
            <Star
              className={`h-4 w-4 ${favoriteFilter ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-6xl px-6 py-4">
        <CandidateTable
          candidates={filtered}
          onSelect={setSelected}
          isLoading={isLoading}
          errorMessage={error ? queryErrorMessage : undefined}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>

      {/* Detail Modal */}
      <CandidateModal
        candidate={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Index;
