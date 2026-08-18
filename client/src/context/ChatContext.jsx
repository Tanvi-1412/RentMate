import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [updatedConvEvent, setUpdatedConvEvent] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

      const newSocket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('[Socket.IO Connected]', newSocket.id);
      });

      newSocket.on('receiveMessage', (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });

      newSocket.on('conversationUpdated', (event) => {
        setUpdatedConvEvent(event);
      });

      newSocket.on('typing', ({ userId }) => setTypingUser(userId));
      newSocket.on('stopTyping', () => setTypingUser(null));

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [isAuthenticated, token]);

  // Automatically join conversation when activeConversation or socket changes
  useEffect(() => {
    if (socket && activeConversation) {
      if (socket.connected) {
        socket.emit('joinConversation', { conversationId: activeConversation });
      }
      const handleConnect = () => {
        socket.emit('joinConversation', { conversationId: activeConversation });
      };
      socket.on('connect', handleConnect);
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [socket, activeConversation]);

  const joinConversation = (conversationId) => {
    setActiveConversation(conversationId);
    if (socket && socket.connected) {
      socket.emit('joinConversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && socket.connected) {
      socket.emit('leaveConversation', { conversationId });
    }
    setActiveConversation(null);
  };

  const sendMessage = (conversationId, text) => {
    if (socket && text.trim()) {
      socket.emit('sendMessage', { conversationId, text });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeConversation,
        messages,
        setMessages,
        typingUser,
        updatedConvEvent,
        joinConversation,
        leaveConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
