import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Printer,
  Search,
  MapPin,
  Briefcase,
  Users,
  FileDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Candidate } from "@/components/CandidateTable";
import eiktoLogo from "@/assets/Logo.png";
import eiktoLogoPrint from "@/assets/eikto-logo.svg";

const Reports = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidatesApi.list(),
  });

  const cities = useMemo(() => {
    const set = new Set(
      candidates.map((c) => c.city).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [candidates]);

  const positions = useMemo(() => {
    const set = new Set(
      candidates.map((c) => c.position).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        !search || c.full_name.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "all" || c.city === cityFilter;
      const matchesPosition =
        positionFilter === "all" || c.position === positionFilter;
      return matchesSearch && matchesCity && matchesPosition;
    });
  }, [candidates, search, cityFilter, positionFilter]);

  const activeFiltersLabel = useMemo(() => {
    const parts: string[] = [];
    if (search) parts.push(`Nome: "${search}"`);
    if (cityFilter !== "all") parts.push(`Cidade: ${cityFilter}`);
    if (positionFilter !== "all") parts.push(`Setor: ${positionFilter}`);
    return parts.length ? parts.join(" • ") : "Todos os candidatos";
  }, [search, cityFilter, positionFilter]);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const headers = [
      "Nome Completo",
      "Email",
      "Telefone",
      "Cidade",
      "Estado",
      "Setor",
      "Experiência (anos)",
      "Formação",
      "Habilidades",
      "Cadastro",
    ];
    const rows = filtered.map((c) => [
      c.full_name,
      c.email || "",
      c.phone || "",
      c.city || "",
      c.state || "",
      c.position || "",
      c.experience_years?.toString() || "",
      c.education || "",
      c.skills || "",
      new Date(c.created_at).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-candidatos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Screen-only controls */}
      <div className="min-h-screen bg-background print:hidden">
        <header className="border-b bg-card/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-base font-semibold text-foreground">
                Relatórios
              </h1>
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="gradient" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {positions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <Card className="border-none bg-gradient-to-r from-primary/5 to-accent/5 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {filtered.length} candidato{filtered.length !== 1 ? "s" : ""}{" "}
                  encontrado{filtered.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeFiltersLabel}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table preview */}
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="rounded-lg border bg-card shadow-sm overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                  <TableHead className="font-semibold">Cidade</TableHead>
                  <TableHead className="font-semibold">Setor</TableHead>
                  <TableHead className="font-semibold">Experiência</TableHead>
                  <TableHead className="font-semibold">Formação</TableHead>
                  <TableHead className="font-semibold">Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Nenhum candidato encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.phone || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.city
                          ? `${c.city}${c.state ? `/${c.state}` : ""}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.position || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.experience_years != null
                          ? `${c.experience_years} ano(s)`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.education || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Print-only layout */}
      <div ref={printRef} className="hidden print:block">
        <div className="px-8 py-6">
          {/* Print header */}
          <div className="flex items-center justify-between border-b-2 border-[hsl(var(--ekt-blue))] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={eiktoLogoPrint}
                alt="EKT Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Banco de Talentos — Relatório
                </h1>
                <p className="text-xs text-gray-500">{activeFiltersLabel}</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>
                Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
                {new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                {filtered.length} candidato{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Print table */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 font-semibold">Nome</th>
                <th className="text-left py-2 font-semibold">Telefone</th>
                <th className="text-left py-2 font-semibold">Cidade/UF</th>
                <th className="text-left py-2 font-semibold">Setor</th>
                <th className="text-left py-2 font-semibold">Exp.</th>
                <th className="text-left py-2 font-semibold">Formação</th>
                <th className="text-left py-2 font-semibold">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-1.5 font-medium">{c.full_name}</td>
                  <td className="py-1.5">{c.phone || "—"}</td>
                  <td className="py-1.5">
                    {c.city ? `${c.city}${c.state ? `/${c.state}` : ""}` : "—"}
                  </td>
                  <td className="py-1.5">{c.position || "—"}</td>
                  <td className="py-1.5">
                    {c.experience_years != null
                      ? `${c.experience_years}a`
                      : "—"}
                  </td>
                  <td className="py-1.5">{c.education || "—"}</td>
                  <td className="py-1.5">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Print footer */}
          <div className="mt-8 border-t pt-3 text-[10px] text-gray-400 flex justify-between">
            <span>EKT — Banco de Talentos</span>
            <span>Documento gerado automaticamente</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
