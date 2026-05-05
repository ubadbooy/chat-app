import { useEffect, useMemo, useState } from 'react';
import { getUsers } from '../services/api';
import { useChatStore } from '../store/useChatStore';

const avatarColors = [
  'bg-[#0a9fec]',
  'bg-[#42b883]',
  'bg-[#ff9f43]',
  'bg-[#7367f0]',
  'bg-[#ea5455]'
];

export default function ChatList({ user, logout }) {
  const [targetId, setTargetId] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const { setCurrentChat, currentChat } = useChatStore();

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError('خطا در دریافت کاربران'));
  }, []);

  const filteredUsers = useMemo(() => {
    const query = targetId.trim().toLowerCase();
    if (!query) return users;

    return users.filter((chatUser) =>
      [chatUser.username, chatUser.email, chatUser._id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [targetId, users]);

  const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || '؟';

  const getAvatarColor = (id = '') => {
    const index = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
    return avatarColors[index];
  };

  const startChatById = () => {
    const chatId = targetId.trim();
    if (!chatId) return;

    const selectedUser = users.find((chatUser) => chatUser._id === chatId) || {
      _id: chatId,
      username: `کاربر ${chatId.slice(0, 6)}`
    };

    setCurrentChat(chatId, selectedUser);
    setTargetId('');
  };

  return (
    <aside className={`${currentChat ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col bg-white lg:w-[390px] lg:border-l lg:border-slate-200`}>
      <header className="shrink-0 border-b border-slate-100 bg-white">
        <div className="flex h-16 items-center gap-3 px-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            aria-label="منو"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-slate-900">بله</h1>
            <p className="truncate text-xs text-slate-500">{user?.username} • {user?.userId}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            خروج
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="flex h-11 items-center gap-2 rounded-xl bg-[#f2f5f8] px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0a9fec]/25">
            <span className="text-lg text-slate-400">⌕</span>
            <input
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && startChatById()}
              placeholder="جستجو یا شناسه کاربر"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {targetId.trim() && (
              <button
                type="button"
                onClick={startChatById}
                className="rounded-lg bg-[#0a9fec] px-3 py-1.5 text-xs font-bold text-white"
              >
                شروع
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex gap-2 border-b border-slate-100 px-4 py-3">
        {['همه', 'شخصی', 'خوانده‌نشده'].map((item, index) => (
          <button
            key={item}
            type="button"
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              index === 0 ? 'bg-[#eaf7ff] text-[#0a9fec]' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white py-2">
        {error && <div className="mx-4 my-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {!error && filteredUsers.length === 0 && (
          <div className="mx-4 mt-8 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7ff] text-2xl">💬</div>
            <p className="font-bold text-slate-800">گفتگویی پیدا نشد</p>
            <p className="mt-1 text-sm text-slate-500">برای شروع، شناسه کاربر را وارد کنید.</p>
          </div>
        )}

        {filteredUsers.map((chatUser) => (
          <button
            key={chatUser._id}
            type="button"
            onClick={() => setCurrentChat(chatUser._id, chatUser)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-right transition ${
              currentChat === chatUser._id ? 'bg-[#eaf7ff]' : 'hover:bg-[#f7f9fb]'
            }`}
          >
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getAvatarColor(chatUser._id)} text-lg font-black text-white`}>
              {getInitial(chatUser.username)}
              <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-[#35c759]" />
            </div>

            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <h2 className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">{chatUser.username}</h2>
                <span className="shrink-0 text-[11px] text-slate-400">اکنون</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
                  {chatUser.status || 'برای شروع گفتگو ضربه بزنید'}
                </p>
                {currentChat === chatUser._id && <span className="h-2 w-2 rounded-full bg-[#0a9fec]" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={startChatById}
        className="absolute bottom-6 right-6 hidden h-14 w-14 items-center justify-center rounded-2xl bg-[#0a9fec] text-3xl text-white shadow-xl shadow-sky-200 transition hover:bg-[#088ed4] lg:flex"
        aria-label="گفتگوی جدید"
      >
        +
      </button>
    </aside>
  );
}
