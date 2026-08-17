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

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
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

      newSocket.on('typing', ({ userId }) => setTypingUser(userId));
      newSocket.on('stopTyping', () => setTypingUser(null));

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [isAuthenticated, token]);

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('joinConversation', { conversationId });
      setActiveConversation(conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leaveConversation', { conversationId });
      setActiveConversation(null);
    }
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
