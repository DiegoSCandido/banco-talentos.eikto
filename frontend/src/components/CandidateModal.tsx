import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Clock,
  Trash2,
  Star,
  Tag,
  Pencil,
  Save,
  X,
  Upload,
  Download,
  ExternalLink,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { candidatesApi, uploadApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Candidate } from "./CandidateTable";

interface CandidateModalProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
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

interface EditForm {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  position: string;
  experience_years: string;
  education: string;
  skills: string;
  notes: string;
  tags: string[];
  status: string;
}

export function CandidateModal({
  candidate,
  open,
  onClose,
  onDelete,
}: CandidateModalProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    position: "",
    experience_years: "",
    education: "",
    skills: "",
    notes: "",
    tags: [],
    status: "disponivel",
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeResume, setRemoveResume] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openResume = async () => {
    if (!candidate) return;
    setLoadingResume(true);
    try {
      const url = await candidatesApi.getResumeUrl(candidate.id);
      setResumeUrl(url);
      setResumeModalOpen(true);
    } catch {
      toast.error("Erro ao abrir currículo.");
    } finally {
      setLoadingResume(false);
    }
  };

  useEffect(() => {
    if (candidate) {
      setForm({
        full_name: candidate.full_name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        city: candidate.city || "",
        state: candidate.state || "",
        position: candidate.position || "",
        experience_years:
          candidate.experience_years != null
            ? String(candidate.experience_years)
            : "",
        education: candidate.education || "",
        skills: candidate.skills || "",
        notes: candidate.notes || "",
        tags: candidate.tags || [],
        status: candidate.status || "disponivel",
      });
      setEditing(false);
      setNewFile(null);
      setRemoveResume(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }
    setSaving(true);
    try {
      let resume_url: string | null | undefined = undefined;

      // Se marcou para remover o currículo
      if (removeResume) {
        resume_url = null;
      }
      // Se selecionou um novo arquivo
      else if (newFile) {
        resume_url = await uploadApi.resume(newFile);
      }

      await candidatesApi.update(candidate.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        position: form.position.trim() || null,
        experience_years: form.experience_years
          ? parseInt(form.experience_years)
          : null,
        education: form.education.trim() || null,
        skills: form.skills.trim() || null,
        notes: form.notes.trim() || null,
        tags: form.tags,
        status: form.status,
        ...(resume_url !== undefined ? { resume_url } : {}),
      });
      toast.success("Candidato atualizado com sucesso");
      setEditing(false);
      setNewFile(null);
      setRemoveResume(false);
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    } catch {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const toggleFavorite = async () => {
    await candidatesApi.setFavorite(candidate.id, !candidate.is_favorite);
    queryClient.invalidateQueries({ queryKey: ["candidates"] });
  };

  const Field = ({
    label,
    value,
    field,
    type = "text",
  }: {
    label: string;
    value: string;
    field: keyof EditForm;
    type?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className="h-9 text-sm"
      />
    </div>
  );

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground">{value || "Não informado"}</p>
      </div>
    </div>
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(false);
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">
                {editing ? "Editar Candidato" : candidate.full_name}
              </DialogTitle>
              <button
                onClick={toggleFavorite}
                className="text-muted-foreground hover:text-[hsl(var(--warning))] transition-colors"
              >
                <Star
                  className={`h-5 w-5 ${candidate.is_favorite ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" : ""}`}
                />
              </button>
            </div>
            {!editing && (
              <div className="flex items-center gap-2 mt-1">
                {candidate.position && (
                  <Badge variant="secondary" className="w-fit">
                    {candidate.position}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={statusColors[candidate.status] || ""}
                >
                  {statusLabels[candidate.status] || candidate.status}
                </Badge>
              </div>
            )}
          </DialogHeader>

          {editing ? (
            <div className="mt-4 space-y-4">
              <Field
                label="Nome completo"
                value={form.full_name}
                field="full_name"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Email"
                  value={form.email}
                  field="email"
                  type="email"
                />
                <Field label="Telefone" value={form.phone} field="phone" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cidade" value={form.city} field="city" />
                <Field label="Estado" value={form.state} field="state" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Setor desejado"
                  value={form.position}
                  field="position"
                />
                <Field
                  label="Experiência (anos)"
                  value={form.experience_years}
                  field="experience_years"
                  type="number"
                />
              </div>
              <Field
                label="Formação"
                value={form.education}
                field="education"
              />
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Habilidades
                </label>
                <Input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Separadas por vírgula"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_processo">Em processo</SelectItem>
                    <SelectItem value="contratado">Contratado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Adicionar tag"
                    className="h-9 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addTag}
                    className="h-9 px-3"
                  >
                    +
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs gap-1 bg-[hsl(var(--ekt-green))]/15 text-[hsl(var(--ekt-green))] border-[hsl(var(--ekt-green))]/30"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Observações
                </label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Currículo
                </Label>
                {candidate.resume_url && !removeResume && !newFile && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm text-muted-foreground">
                      Currículo anexado
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRemoveResume(true)}
                      className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                )}
                {(removeResume || !candidate.resume_url) && !newFile && (
                  <div className="space-y-2">
                    {removeResume && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                        Currículo será removido ao salvar
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewFile(file);
                          if (file) setRemoveResume(false);
                        }}
                        className="h-9 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
                      />
                      {removeResume && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setRemoveResume(false)}
                          className="h-9"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {newFile && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm text-foreground">
                      {newFile.name}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNewFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="h-7 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[hsl(var(--ekt-blue))] to-[hsl(var(--ekt-green))] text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 divide-y">
                <div className="grid gap-1 pb-4">
                  <InfoRow icon={Mail} label="Email" value={candidate.email} />
                  <InfoRow
                    icon={Phone}
                    label="Telefone"
                    value={candidate.phone}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Localização"
                    value={
                      candidate.city
                        ? `${candidate.city}${candidate.state ? `, ${candidate.state}` : ""}`
                        : null
                    }
                  />
                </div>
                <div className="grid gap-1 py-4">
                  <InfoRow
                    icon={Briefcase}
                    label="Setor desejado"
                    value={candidate.position}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Experiência"
                    value={
                      candidate.experience_years != null
                        ? `${candidate.experience_years} ano(s)`
                        : null
                    }
                  />
                  <InfoRow
                    icon={GraduationCap}
                    label="Formação"
                    value={candidate.education}
                  />
                </div>
                {candidate.tags && candidate.tags.length > 0 && (
                  <div className="py-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Tag className="inline h-3.5 w-3.5 mr-1" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="text-xs bg-[hsl(var(--ekt-green))]/15 text-[hsl(var(--ekt-green))] border-[hsl(var(--ekt-green))]/30"
                          variant="outline"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.skills && (
                  <div className="py-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Habilidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.split(",").map((s) => (
                        <Badge
                          key={s.trim()}
                          variant="outline"
                          className="text-xs"
                        >
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.notes && (
                  <div className="py-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Observações
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {candidate.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  {candidate.resume_url && (
                    <Button
                      variant="outline"
                      onClick={openResume}
                      disabled={loadingResume}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {loadingResume ? "Abrindo..." : "Ver Currículo"}
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {!candidate.resume_url && (
                    <span className="text-sm text-muted-foreground">
                      Sem currículo anexado
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                    onClick={() => onDelete(candidate.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização do Currículo */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-lg">
                Currículo - {candidate?.full_name}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    resumeUrl &&
                    window.open(resumeUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir em Nova Aba
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (resumeUrl) {
                      const link = document.createElement("a");
                      link.href = resumeUrl;
                      link.download = `curriculo-${candidate?.full_name.replace(/\s+/g, "-")}.pdf`;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full overflow-hidden p-4">
            {resumeUrl && (
              <iframe
                src={resumeUrl}
                className="w-full h-full rounded-lg border border-border"
                title="Visualização do Currículo"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
