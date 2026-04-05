import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { candidatesApi, uploadApi } from "@/lib/api";
import { toast } from "sonner";

interface AddCandidateDialogProps {
  onAdded: () => void;
  triggerClassName?: string;
}

export function AddCandidateDialog({
  onAdded,
  triggerClassName,
}: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    position: "",
    skills: "",
    experience_years: "",
    education: "",
    notes: "",
    status: "disponivel",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      position: "",
      skills: "",
      experience_years: "",
      education: "",
      notes: "",
      status: "disponivel",
    });
    setTags([]);
    setTagInput("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error("Nome completo é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      let resume_url: string | null = null;

      if (file) {
        resume_url = await uploadApi.resume(file);
      }

      await candidatesApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        position: form.position.trim() || null,
        skills: form.skills.trim() || null,
        experience_years: form.experience_years
          ? parseInt(form.experience_years)
          : null,
        education: form.education.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
        tags: tags.length > 0 ? tags : null,
        resume_url,
        is_favorite: false,
      });

      toast.success("Candidato adicionado com sucesso!");
      reset();
      setOpen(false);
      onAdded();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar candidato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerClassName ? "ghost" : "gradient"}
          className={triggerClassName}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Candidato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Candidato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Maria Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="maria@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="SP"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="position">Cargo Desejado</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => update("position", e.target.value)}
                placeholder="Analista de RH"
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Anos de Experiência</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                value={form.experience_years}
                onChange={(e) => update("experience_years", e.target.value)}
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="education">Formação</Label>
            <Input
              id="education"
              value={form.education}
              onChange={(e) => update("education", e.target.value)}
              placeholder="Graduação em Administração"
            />
          </div>

          <div>
            <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
            <Input
              id="skills"
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="Excel, Comunicação, Liderança"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_processo">Em processo</SelectItem>
                <SelectItem value="contratado">Contratado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ex: React, Remoto..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
              >
                +
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="resume">Currículo (PDF ou Word)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                ref={fileRef}
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
              />
              {file && <Upload className="h-4 w-4 text-accent" />}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Salvando..." : "Salvar Candidato"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
