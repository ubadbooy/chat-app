import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import { getMessages } from '../services/api';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { currentChat, setMessages, addMessage } = useChatStore();
  const [socket, setSocket] = useState(null);

  const handleLogout = () => {
    disconnectSocket();
    setMessages([]);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (user && !user.profileCompleted) {
      navigate('/profile-setup');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!token) return undefined;

    const newSocket = connectSocket(token);
    setSocket(newSocket);
    newSocket.on('receive-message', addMessage);
    newSocket.on('message-sent', addMessage);

    return () => {
      newSocket.off('receive-message', addMessage);
      newSocket.off('message-sent', addMessage);
      disconnectSocket();
      setSocket(null);
    };
  }, [addMessage, token]);

  useEffect(() => {
    if (currentChat && token) {
      getMessages(currentChat)
        .then(setMessages)
        .catch(() => setMessages([]));
    }
  }, [currentChat, setMessages, token]);

  return (
    <main dir="rtl" className="chat-shell h-[100dvh] overflow-hidden bg-[#edf3f8] text-slate-900">
      <div className="mx-auto flex h-full max-w-[1500px] overflow-hidden bg-white shadow-2xl lg:h-[calc(100dvh-20px)] lg:translate-y-2.5 lg:rounded-2xl lg:border lg:border-slate-200">
        <ChatList user={user} logout={handleLogout} />
        <ChatWindow socket={socket} user={user} />
      </div>
    </main>
  );
}
