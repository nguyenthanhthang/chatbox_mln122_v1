import { useEffect, useState } from "react";
import { socketService } from "../services/socket.service";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on("connected", handleConnect);
    socketService.on("disconnected", handleDisconnect);

    return () => {
      socketService.off("connected", handleConnect);
      socketService.off("disconnected", handleDisconnect);
    };
  }, []);

  return {
    isConnected,
    socket: socketService,
  };
};
