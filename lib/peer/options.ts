import type { PeerOptions } from "peerjs";

export const PEER_OPTIONS: PeerOptions = {
  config: {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  },
};
