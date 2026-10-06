import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;
const KEY = "playerKey";

// Lets the server recognise this tab when it reconnects, so the player keeps their score
const randomKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
const playerKey = sessionStorage.getItem(KEY) ?? randomKey();
sessionStorage.setItem(KEY, playerKey);

export const socket = io(URL, { auth: { playerKey } });

export const savedName = () =>
  sessionStorage.getItem("username")?.trim() || "Anonymous";
