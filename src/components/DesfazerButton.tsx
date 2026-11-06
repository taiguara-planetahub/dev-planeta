"use client";

import { useTransition } from "react";
import { desfazerMovimentacao } from "@/app/actions";

export default function DesfazerButton({ id }: { id: number }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Desfazer o lançamento #${id}? Será lançada a movimentação contrária.`)) return;
        start(async () => {
          const r = await desfazerMovimentacao(id);
          if (!r.ok && r.message) alert(r.message);
        });
      }}
      className="font-medium text-slate-400 hover:text-rose-600 disabled:opacity-50"
    >
      {pending ? "Desfazendo..." : "Desfazer"}
    </button>
  );
}
