import { io } from "socket.io-client";
import useApiURL from "./useApiURL";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  return io(useApiURL("http://localhost:8000"), options);
};
