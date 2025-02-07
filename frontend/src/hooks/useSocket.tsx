import { useEffect } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000");

const useSocket = (): Socket => {

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return socket;
};

export default useSocket;
