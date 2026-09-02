"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { copyText } from "@/lib/clipboard";
import { viewerPath } from "@/lib/routes";

const COPIED_FEEDBACK_MS = 2_200;

const subscribeToNothing = () => () => undefined;

function useOrigin(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => "",
  );
}

export function ShareLink({ presenterId }: { presenterId: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const origin = useOrigin();
  const feedbackTimer = useRef<number | null>(null);
  const link = `${origin}${viewerPath(presenterId)}`;

  useEffect(() => () => window.clearTimeout(feedbackTimer.current ?? undefined), []);

  const copy = async () => {
    await copyText(link);
    setIsCopied(true);
    window.clearTimeout(feedbackTimer.current ?? undefined);
    feedbackTimer.current = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <Field>
      <FieldLabel htmlFor="share-link">Link para espectadores</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="share-link"
          value={link}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          className="font-mono text-xs"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Copiar link da transmissão"
            onClick={copy}
          >
            {isCopied ? <Check /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
