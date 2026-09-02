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

### Som só de guia, e por que não dá para fazer melhor

Não há captura de microfone, e o áudio do sistema nunca entra na transmissão. Isso significa que
**guia é a única fonte que transmite som**: janelas e telas inteiras podem ser compartilhadas, mas
vão só com vídeo.

Não é uma escolha de produto, é o limite da plataforma. Capturar o som de um aplicativo específico
é API de sistema operacional — no Windows 10 2004+, o *process loopback* do WASAPI. Nenhuma API web
expõe isso. O que o `getDisplayMedia` entrega, por tipo de fonte:

| Fonte     | Áudio disponível no navegador       |
| --------- | ----------------------------------- |
| Guia      | o áudio daquela guia, isolado       |
| Janela    | nenhum, ou o áudio do sistema todo  |
| Tela      | o áudio do sistema todo             |

O Chrome 141 trouxe a constraint `windowAudio`, que aceita `"system"`, `"window"` e `"exclude"`.
O valor `"window"` parece resolver o caso, mas não resolve: é um hint que o navegador pode ignorar
sem violar a spec, e uma `MediaStreamTrack` não informa a origem do seu áudio. Se o Chrome nos
devolvesse uma faixa numa janela compartilhada, não haveria como distinguir o som daquele aplicativo
do mix do sistema inteiro. Vazar o áudio do sistema em silêncio é pior que não ter áudio, então a
opção usada é `"exclude"` — a única verificável.

As constraints, então:

- `systemAudio: "exclude"` — o Chrome não oferece o áudio do sistema quando a fonte é uma tela;
- `windowAudio: "exclude"` — nem quando é uma janela;
- `displaySurface: "browser"` — o seletor abre no painel de guias, o caminho com som. Janelas e
  telas seguem acessíveis, e o apresentador vê um aviso explicando por que a fonte dele saiu muda;
- `selfBrowserSurface: "exclude"` — a própria aba do apresentador não aparece como opção;
- `surfaceSwitching: "exclude"` — desliga o "Compartilhar esta guia em vez desta" da barra do
  Chrome, deixando a troca de fonte só pelo botão da aplicação. Ver abaixo.

O aviso de "transmitindo sem áudio" tem duas versões, porque as causas têm consertos diferentes:
numa guia, faltou marcar "Compartilhar áudio da guia"; numa janela ou tela, não há o que marcar.
`CaptureSource.isTab` vem de `displaySurface` e é o que separa os dois casos.

### Trocar de fonte sem derrubar a transmissão

`createScreenCapture()` devolve uma sessão com um `MediaStream` de identidade fixa: `selectSource()`
abre o seletor, troca a faixa de vídeo dentro desse mesmo stream e a repassa ao hook, que faz
`replaceTrack` em cada sender ativo. Como `replaceTrack` não exige renegociação, o espectador não
recebe um novo evento `stream` — o vídeo dele só muda de conteúdo.

O áudio não é trocado assim. Ele atravessa um `MediaStreamAudioDestinationNode` que funciona como
barramento: a faixa que vai pelo fio é sempre a saída do barramento, e trocar de fonte só reconecta
a entrada. Sem isso, começar por uma janela (sem áudio) significaria não haver sender de áudio
negociado, e nenhuma troca posterior para uma guia com som conseguiria acrescentar um — o PeerJS não
renegocia. Fonte sem áudio vira silêncio no barramento, e a guia seguinte volta a soar.

É por isso que `surfaceSwitching` fica desligado: se o Chrome trocasse a fonte por conta própria, o
barramento continuaria conectado na faixa de áudio antiga.
