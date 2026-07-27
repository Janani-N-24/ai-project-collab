import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up any existing connection on logout
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      // socket.io-client reconnects automatically by default; these just make
      // the retry loop a bit faster/friendlier for a live demo.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const joinProject = (projectId) => socketRef.current?.emit('joinProject', projectId);
  const leaveProject = (projectId) => socketRef.current?.emit('leaveProject', projectId);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
