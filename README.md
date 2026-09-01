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
  styles/          folhas de estilo por área da interface
components/        UI compartilhada entre as rotas
lib/
  peer/            opções do peer, protocolo de mensagens, qualidade de vídeo, registro de espectadores
  screen-capture   captura de tela e mixagem de áudio (tela + microfone)
```

Cada rota tem uma página de servidor (casca) e um componente cliente com a lógica interativa. Toda a
conversa com o PeerJS vive nos hooks (`use-broadcast`, `use-viewer-session`); os componentes só
recebem estado e disparam ações.

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
