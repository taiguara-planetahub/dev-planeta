import Link from "next/link";

const btnBase =
  "inline-flex items-center justify-center gap-1 rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50";

export const btnCls = `${btnBase} bg-blue-600 text-white hover:bg-blue-700`;
export const btnEntradaCls = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`;
export const btnSaidaCls = `${btnBase} bg-rose-600 text-white hover:bg-rose-700`;
export const btnSecCls = `${btnBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const btnDangerCls = `${btnBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50`;

export const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export const cardCls = "rounded-xl border border-slate-200 bg-white shadow-sm";

export const tableWrapCls = `${cardCls} overflow-x-auto`;
export const tableCls = "w-full text-left text-sm";
export const theadCls = "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500";
export const thCls = "px-4 py-3 font-medium";
export const tdCls = "px-4 py-3";
export const tbodyCls = "divide-y divide-slate-100";
export const trCls = "hover:bg-slate-50";
export const linkCls = "font-medium text-blue-600 hover:underline";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error?.[0] && <span className="block text-xs text-rose-600">{error[0]}</span>}
    </label>
  );
}

export function Alert({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-md border px-3 py-2 text-sm ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {children}
    </p>
  );
}

const badgeBase = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function TipoBadge({ tipo }: { tipo: "ENTRADA" | "SAIDA" }) {
  return tipo === "ENTRADA" ? (
    <span className={`${badgeBase} bg-emerald-100 text-emerald-700`}>Entrada</span>
  ) : (
    <span className={`${badgeBase} bg-rose-100 text-rose-700`}>Saída</span>
  );
}

export function SaldoBadge({ saldo, minimo }: { saldo: number; minimo: number }) {
  if (saldo <= 0) return <span className={`${badgeBase} bg-rose-100 text-rose-700`}>Sem estoque</span>;
  if (saldo <= minimo) return <span className={`${badgeBase} bg-amber-100 text-amber-700`}>Baixo</span>;
  return <span className={`${badgeBase} bg-emerald-100 text-emerald-700`}>OK</span>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={btnCls}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-900">{children}</h2>
      {extra}
    </div>
  );
}
