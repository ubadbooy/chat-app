import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';

const formatMessageTime = (dateValue) => {
  if (!dateValue) return 'now';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'now';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatWindow({ socket, user }) {
  const [message, setMessage] = useState('');
  const endOfMessagesRef = useRef(null);
  const { messages, currentChat, currentChatUser, closeCurrentChat } = useChatStore();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentChat]);

  const sendMessage = () => {
    const content = message.trim();
    if (content && socket && currentChat) {
      socket.emit('send-message', { receiverId: currentChat, content });
      setMessage('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const chatTitle = currentChatUser?.displayName || currentChatUser?.username || 'Private chat';
  const chatSubtitle = currentChatUser?.customId ? `@${currentChatUser.customId}` : (currentChatUser?.status || `ID: ${currentChat}`);
  const chatInitial = chatTitle?.trim()?.charAt(0)?.toUpperCase() || '?';

  if (!currentChat) {
    return (
      <section className="hidden flex-1 items-center justify-center bg-slate-100 p-6 lg:flex">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-slate-200 ring-1 ring-slate-200">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-200/60 blur-2xl" />
          <div className="absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-cyan-200/60 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#2aabee] to-[#168acd] text-5xl text-white shadow-2xl shadow-sky-200">
              ✈
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Choose a conversation</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Select a chat from the left, or paste a user ID to start messaging instantly.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
              {['Fast', 'Clean', 'Responsive'].map((label) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-600">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${currentChat ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1 flex-col bg-[#d9e8f2]`}>
      <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={closeCurrentChat}
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Back to chats"
          >
            ‹
          </button>
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 font-black text-white shadow-md">
            {chatInitial}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">{chatTitle}</h2>
            <p className="truncate text-xs font-medium text-[#168acd]">{chatSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button type="button" className="hidden rounded-full p-2.5 transition hover:bg-slate-100 sm:block" aria-label="Voice call">
            ☎
          </button>
          <button type="button" className="rounded-full p-2.5 transition hover:bg-slate-100" aria-label="Search messages">
            ⌕
          </button>
          <button type="button" className="rounded-full p-2.5 text-xl transition hover:bg-slate-100" aria-label="More actions">
            ⋮
          </button>
        </div>
      </header>

      <div className="chat-wallpaper min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <div className="mx-auto mb-4 rounded-full bg-slate-900/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
            Today
          </div>

          {messages.length === 0 && (
            <div className="mx-auto mt-16 max-w-sm rounded-[2rem] bg-white/90 p-7 text-center shadow-lg shadow-slate-300/40 backdrop-blur">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-3xl">✨</div>
              <h3 className="text-lg font-black text-slate-950">Start the conversation</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Send a friendly message. The layout stays comfortable on phones and wide screens.</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMine = msg.sender?._id === user.userId || msg.sender === user.userId;

            return (
              <div key={msg._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble max-w-[86%] px-4 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[70%] ${
                  isMine
                    ? 'message-bubble-mine bg-[#e8ffd8] text-slate-950'
                    : 'message-bubble-other bg-white text-slate-950'
                }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`mt-1 flex items-center gap-1 text-[11px] ${isMine ? 'justify-end text-emerald-700/70' : 'justify-start text-slate-400'}`}>
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMine && <span>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <div className="shrink-0 bg-white/90 px-3 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur sm:px-5">
        <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-[1.75rem] bg-slate-100 p-2 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-[#2aabee]">
          <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-white" aria-label="Attach file">
            ＋
          </button>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 outline-none placeholder:text-slate-400"
          />
          <button type="button" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-white sm:flex" aria-label="Emoji">
            ☺
          </button>
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !socket}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2aabee] text-lg font-black text-white shadow-lg shadow-sky-200 transition hover:bg-[#1e9edc] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </section>
  );
}
