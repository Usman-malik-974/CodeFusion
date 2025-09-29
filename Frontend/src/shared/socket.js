// src/shared/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false, // connect manually
});

export default socket;