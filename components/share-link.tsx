"use client";

import { useEffect, useRef, useState } from "react";

import { copyText } from "@/lib/clipboard";
import { viewerPath } from "@/lib/routes";

const COPIED_FEEDBACK_MS = 2_200;

export function ShareLink({ presenterId }: { presenterId: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const feedbackTimer = useRef<number | null>(null);
  const path = viewerPath(presenterId);

  useEffect(() => () => window.clearTimeout(feedbackTimer.current ?? undefined), []);

  const copy = async () => {
    await copyText(new URL(path, window.location.origin).toString());
    setIsCopied(true);
    window.clearTimeout(feedbackTimer.current ?? undefined);
    feedbackTimer.current = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <div className="share-id">
      <small>Link para espectadores</small>
      <div className="share-id-row">
        <code>{path}</code>
        <button
          className="copy-button"
          type="button"
          onClick={copy}
          aria-label="Copiar link da transmissão"
        >
          {isCopied ? "Copiado" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
