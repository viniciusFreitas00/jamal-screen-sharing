"use client";

import { useState, type FormEvent } from "react";

type JoinRequest = {
  username: string;
  presenterId: string;
};

type JoinFormProps = {
  initialPresenterId: string;
  disabled: boolean;
  submitLabel: string;
  onJoin: (request: JoinRequest) => void;
};

export function JoinForm({ initialPresenterId, disabled, submitLabel, onJoin }: JoinFormProps) {
  const [username, setUsername] = useState("");
  const [presenterId, setPresenterId] = useState(initialPresenterId);
  const isIncomplete = username.trim() === "" || presenterId.trim() === "";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoin({ username, presenterId });
  };

  return (
    <form className="viewer-form" onSubmit={submit}>
      <label htmlFor="username">Seu nome</label>
      <input
        id="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Como podemos te chamar?"
        autoComplete="name"
        maxLength={40}
      />
      <label htmlFor="presenter-id">ID do apresentador</label>
      <input
        id="presenter-id"
        value={presenterId}
        onChange={(event) => setPresenterId(event.target.value)}
        placeholder="Cole o ID aqui"
        autoComplete="off"
        spellCheck={false}
      />
      <button className="primary-button" type="submit" disabled={disabled || isIncomplete}>
        {submitLabel}
      </button>
    </form>
  );
}
