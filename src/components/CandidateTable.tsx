import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User, Star, StarOff } from "lucide-react";
import { candidatesApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export type Candidate = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  position: string | null;
  skills: string | null;
  experience_years: number | null;
  education: string | null;
  notes: string | null;
  resume_url: string | null;
  is_favorite: boolean;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

interface CandidateTableProps {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
  isLoading: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const statusLabels: Record<string, string> = {
  disponivel: "Disponível",
  em_processo: "Em processo",
  contratado: "Contratado",
};

const statusColors: Record<string, string> = {
  disponivel:
    "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  em_processo:
    "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  contratado:
    "bg-[hsl(var(--ekt-blue))]/15 text-[hsl(var(--ekt-blue))] border-[hsl(var(--ekt-blue))]/30",
};

export function CandidateTable({
  candidates,
  onSelect,
  isLoading,
  errorMessage,
  onRetry,
}: CandidateTableProps) {
  const queryClient = useQueryClient();

  const toggleFavorite = async (e: React.MouseEvent, candidate: Candidate) => {
    e.stopPropagation();
    await candidatesApi.setFavorite(candidate.id, !candidate.is_favorite);
    queryClient.invalidateQueries({ queryKey: ["candidates"] });
  };
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Cidade</TableHead>
              <TableHead className="font-semibold">Telefone</TableHead>
              <TableHead className="font-semibold">Cargo</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <User className="mb-3 h-10 w-10 text-destructive/70" />
        <p className="text-lg font-medium text-foreground">
          Erro ao carregar candidatos
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {errorMessage}
        </p>
        {onRetry ? (
          <Button className="mt-4" variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <User className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-lg font-medium text-foreground">
          Nenhum candidato encontrado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione um novo candidato ou ajuste os filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm animate-fade-in-up">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10"></TableHead>
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Cidade</TableHead>
            <TableHead className="font-semibold">Telefone</TableHead>
            <TableHead className="font-semibold">Cargo</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((c, i) => (
            <TableRow
              key={c.id}
              onClick={() => onSelect(c)}
              className="cursor-pointer transition-colors hover:bg-primary/5 active:scale-[0.995]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <TableCell>
                <button
                  onClick={(e) => toggleFavorite(e, c)}
                  className="text-muted-foreground hover:text-[hsl(var(--warning))] transition-colors"
                >
                  {c.is_favorite ? (
                    <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>
              </TableCell>
              <TableCell className="font-medium">{c.full_name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {c.city ? `${c.city}${c.state ? `, ${c.state}` : ""}` : "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone || "—"}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.position || "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[c.status] || ""}
                >
                  {statusLabels[c.status] || c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {new Date(c.created_at).toLocaleDateString("pt-BR")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
