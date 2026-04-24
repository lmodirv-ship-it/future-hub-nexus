import { useState } from "react";
import { X } from "lucide-react";

export type AddSitePayload = {
  name: string;
  domain: string;
  github_repo: string;
  github_branch: string;
  origin_server: string;
  notes: string;
  enabled: boolean;
};

export function AddSiteModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddSitePayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<AddSitePayload>({
    name: "",
    domain: "",
    github_repo: "",
    github_branch: "main",
    origin_server: "",
    notes: "",
    enabled: true,
  });
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  function update<K extends keyof AddSitePayload>(k: K, v: AddSitePayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.domain.trim()) return;
    setBusy(true);
    try {
      await onSubmit(form);
      setForm({
        name: "",
        domain: "",
        github_repo: "",
        github_branch: "main",
        origin_server: "",
        notes: "",
        enabled: true,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold neon-text">إضافة موقع جديد</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="اسم الموقع *" required>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="مثال: غسيل السيارات هيبا"
              className="input-field"
            />
          </Field>

          <Field label="الدومين *" required>
            <input
              required
              value={form.domain}
              onChange={(e) => update("domain", e.target.value)}
              placeholder="example.com"
              className="input-field"
              dir="ltr"
            />
          </Field>

          <Field label="رابط GitHub Repo">
            <input
              value={form.github_repo}
              onChange={(e) => update("github_repo", e.target.value)}
              placeholder="https://github.com/user/repo"
              className="input-field"
              dir="ltr"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الفرع (Branch)">
              <input
                value={form.github_branch}
                onChange={(e) => update("github_branch", e.target.value)}
                placeholder="main"
                className="input-field"
                dir="ltr"
              />
            </Field>
            <Field label="السيرفر الأصلي">
              <input
                value={form.origin_server}
                onChange={(e) => update("origin_server", e.target.value)}
                placeholder="LWS / Vercel / ..."
                className="input-field"
              />
            </Field>
          </div>

          <Field label="ملاحظات">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              className="h-4 w-4"
            />
            مفعّل (يُراقب تلقائياً)
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2.5 text-sm font-bold text-background neon-glow disabled:opacity-50"
            >
              {busy ? "جارِ الحفظ..." : "إضافة الموقع"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-pink-400"> *</span>}
      </span>
      {children}
    </label>
  );
}