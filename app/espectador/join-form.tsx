"use client";

import { LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type JoinRequest = {
  username: string;
  presenterId: string;
};

type JoinFormProps = {
  initialPresenterId: string;
  disabled: boolean;
  isConnecting: boolean;
  submitLabel: string;
  onJoin: (request: JoinRequest) => void;
};

export function JoinForm({
  initialPresenterId,
  disabled,
  isConnecting,
  submitLabel,
  onJoin,
}: JoinFormProps) {
  const [username, setUsername] = useState("");
  const [presenterId, setPresenterId] = useState(initialPresenterId);
  const isIncomplete = username.trim() === "" || presenterId.trim() === "";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoin({ username, presenterId });
  };

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Seu nome</FieldLabel>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Como podemos te chamar?"
            autoComplete="name"
            maxLength={40}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="presenter-id">ID do apresentador</FieldLabel>
          <Input
            id="presenter-id"
            value={presenterId}
            onChange={(event) => setPresenterId(event.target.value)}
            placeholder="Cole o ID aqui"
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
          <FieldDescription>
            Está no link ou no painel de quem está apresentando.
          </FieldDescription>
        </Field>
        <Button type="submit" size="lg" disabled={disabled || isIncomplete}>
          {isConnecting ? <Spinner /> : <LogIn />}
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
