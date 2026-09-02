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
| `/apresentador` | Captura a tela, publica o peer id, envia a mídia e permite trocar a fonte |
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
  peer/            opções, mensagens, sender e qualidade de vídeo, registro de espectadores
  screen-capture   sessão de captura: escolhe a fonte, troca de fonte e publica o áudio da guia
  display-media    constraints do getDisplayMedia que o lib.dom do TypeScript ainda não declara
  utils            cn(), usado por todos os componentes do shadcn
```

Cada rota tem uma página de servidor (casca) e um componente cliente com a lógica interativa. Toda a
conversa com o PeerJS vive nos hooks (`use-broadcast`, `use-viewer-session`); os componentes só
recebem estado e disparam ações.
