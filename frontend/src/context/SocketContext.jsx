import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('connect_error', () => setConnected(false));

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
