# Tela ao vivo

Compartilhamento de tela com áudio direto no navegador, ponto a ponto (WebRTC via
[PeerJS](https://peerjs.com)). O vídeo nunca passa por um servidor da aplicação: o servidor de
sinalização público do PeerJS apenas apresenta os dois lados, e a mídia segue direto entre eles.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), entre em `/apresentador` para transmitir e use
o link gerado (`/espectador?id=<peer-id>`) para assistir.

## Rotas

| Rota            | Papel                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| `/`             | Escolha do modo (apresentador ou espectador)                              |
| `/apresentador` | Captura a tela, publica um peer id e envia a mídia para cada espectador   |
| `/espectador`   | Conecta-se a um peer id, anuncia presença e recebe a transmissão          |

## Estrutura

```
app/
  apresentador/    página, sala e hook de transmissão
  espectador/      página, sala, formulário de entrada e hook de sessão
  globals.css      Tailwind, tokens do shadcn e temas claro/escuro
components/
  ui/              componentes gerados pelo shadcn
  *.tsx            composições compartilhadas entre as rotas
lib/
  peer/            opções do peer, protocolo de mensagens, qualidade de vídeo, registro de espectadores
  screen-capture   captura de tela e mixagem de áudio (tela + microfone)
  utils            cn(), usado por todos os componentes do shadcn
```

Cada rota tem uma página de servidor (casca) e um componente cliente com a lógica interativa. Toda a
conversa com o PeerJS vive nos hooks (`use-broadcast`, `use-viewer-session`); os componentes só
recebem estado e disparam ações.

## Interface

Tailwind CSS v4 com [shadcn/ui](https://ui.shadcn.com) (estilo `base-nova`, primitivas Base UI,
ícones lucide). Não há CSS próprio: `app/globals.css` guarda apenas os tokens e o tema, e o resto é
utilitário nas próprias telas. Para adicionar um componente:

```bash
npx shadcn@latest add <nome>
```

O tema escuro segue o sistema operacional. Para isso o variant `dark` do Tailwind foi redefinido
como media query:

```css
@custom-variant dark (@media (prefers-color-scheme: dark));
```

Assim os utilitários `dark:` que vêm dentro dos componentes do shadcn respondem ao
`prefers-color-scheme`, e os tokens ficam declarados uma única vez por tema. Se algum dia houver um
botão de troca, basta voltar o variant para `(&:is(.dark *))`, mover os tokens escuros para `.dark`
e aplicar a classe no `<html>`.

## Protocolo entre os pares

O canal de dados carrega duas mensagens, definidas em `lib/peer/messages.ts`:

- `viewer-presence`: enviada uma vez na entrada, com o nome escolhido pelo espectador;
- `viewer-heartbeat`: enviada a cada 4s para manter a presença.

O apresentador marca como desconectado quem fica 12s sem sinal — necessário porque o evento `close`
do WebRTC não chega de forma confiável quando a aba do espectador é fechada.

## Decisões de mídia

`lib/video-profile.ts` concentra o alvo de captura (1920x1080, 30fps, 4 Mbps). O encoder recebe
`degradationPreference: "maintain-resolution"` porque texto legível importa mais que fluidez em
compartilhamento de tela.
