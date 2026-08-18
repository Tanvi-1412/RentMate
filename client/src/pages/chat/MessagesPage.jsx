import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { currentUser } = useAuth();
  const { joinConversation, sendMessage, messages, setMessages, socket, updatedConvEvent } = useChat();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [convError, setConvError] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUserIdStr = (currentUser?.id || currentUser?._id)?.toString();

  // Load conversation list once on mount
  useEffect(() => {
    API.get('/conversations')
      .then((res) => {
        if (res.data.success) {
          setConversations(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Update sidebar list in real time when a new message arrives
  useEffect(() => {
    if (updatedConvEvent) {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === updatedConvEvent.conversationId
            ? { ...c, lastMessage: updatedConvEvent.lastMessage, lastMessageAt: updatedConvEvent.lastMessageAt }
            : c
        )
      );
    }
  }, [updatedConvEvent]);

  // Determine active conversation ID (from URL param or default to first conversation)
  const activeId = conversationId || (conversations.length > 0 ? conversations[0]._id : null);

  useEffect(() => {
    if (activeId) {
      setConvError('');
      API.get(`/conversations/${activeId}`)
        .then((res) => {
          if (res.data.success) {
            setSelectedConv(res.data.data);
            joinConversation(activeId);
          }
        })
        .catch((err) => {
          console.error('Error fetching conversation details:', err);
          setSelectedConv(null);
          setConvError(err.response?.data?.message || 'Conversation not found or access denied.');
        });

      API.get(`/conversations/${activeId}/messages`)
        .then((res) => {
          if (res.data.success) {
            setMessages(res.data.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching messages:', err);
          setMessages([]);
        });
    } else {
      setSelectedConv(null);
      setMessages([]);
      setConvError('');
    }
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (text && activeId) {
      setInputMsg('');
      if (socket && socket.connected) {
        // Emit via Socket.IO (Socket backend will save to DB and broadcast once)
        sendMessage(activeId, text);
      } else {
        // Fallback to REST API if Socket is disconnected
        try {
          const res = await API.post(`/conversations/${activeId}/messages`, { text });
          if (res.data.success) {
            setMessages((prev) => {
              const exists = prev.some((m) => m._id === res.data.data._id);
              if (exists) return prev;
              return [...prev, res.data.data];
            });
          }
        } catch (err) {
          console.error('Error posting message:', err);
        }
      }
    }
  };

  const getOtherParticipant = (participants) => {
    if (!participants || participants.length === 0) return null;
    return (
      participants.find((p) => (p._id || p.id || p)?.toString() !== currentUserIdStr) ||
      participants[0]
    );
  };

  const activeOtherUser = selectedConv ? getOtherParticipant(selectedConv.participants) : null;

  return (

      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            Conversations ({conversations.length})
          </div>
          {loading ? (
            <LoadingSpinner text="Loading chats..." size={80} />
          ) : conversations.length === 0 ? (
            <div style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No chats active yet. Start a chat from any product page or accepted request!
            </div>
          ) : (
            conversations.map((c) => {
              const otherUser = getOtherParticipant(c.participants);
              const isSelected = c._id === activeId;

              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/messages/${c._id}`)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>{otherUser?.name || 'Student'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    📦 {c.productId?.title || 'RentMate Item'}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Main Chat Window */}
        <div className="chat-window">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {activeOtherUser?._id ? (
                      <Link
                        to={`/profile/${activeOtherUser._id}`}
                        style={{ color: 'var(--text-main)', textDecoration: 'underline' }}
                      >
                        {activeOtherUser.name}
                      </Link>
                    ) : (
                      <span>{activeOtherUser?.name || 'Student'}</span>
                    )}
                    {activeOtherUser?.status === 'ACTIVE' || activeOtherUser?.isVerified ? (
                      <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>
                        ✅ Verified Student
                      </span>
                    ) : (
                      <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                        ⏳ Pending
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Item: {selectedConv.productId?.title || 'RentMate Item'}
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No messages yet. Send a greeting to arrange pickup or rental details!
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const senderIdStr = (m.senderId?._id || m.senderId?.id || m.senderId)?.toString();
                    const isMe = senderIdStr === currentUserIdStr;
                    return (
                      <div key={m._id || idx} className={`chat-bubble ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                        <p>{m.text}</p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="chat-input-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type message to arrange pickup/payment outside website..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </form>
            </>
          ) : convError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--danger)', marginBottom: '0.5rem' }}>
                Conversation Not Found or Access Denied
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: '1.5rem' }}>
                {convError}
              </p>
              {conversations.length > 0 ? (
                <button
                  onClick={() => navigate(`/messages/${conversations[0]._id}`)}
                  className="btn btn-primary btn-sm"
                >
                  💬 Open My Active Chat
                </button>
              ) : (
                <button onClick={() => navigate('/browse')} className="btn btn-primary btn-sm">
                  🔍 Browse Products to Start a Chat
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a conversation from the sidebar to view chat messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
