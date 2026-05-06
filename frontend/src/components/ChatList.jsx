import { useEffect, useMemo, useState } from 'react';
import { getUsers } from '../services/api';
import { useChatStore } from '../store/useChatStore';
import api from '../services/api';
import ProfilePanel from './ProfilePanel';

const avatarColors = [
  'bg-[#0a9fec]',
  'bg-[#42b883]',
  'bg-[#ff9f43]',
  'bg-[#7367f0]',
  'bg-[#ea5455]'
];

export default function ChatList({ user, logout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { setCurrentChat, currentChat } = useChatStore();

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError('خطا در دریافت کاربران'));
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      const query = searchQuery.trim();
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/messages/search?query=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayedUsers = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return searchResults;
    }
    return users;
  }, [searchQuery, searchResults, users]);

  const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || '؟';

  const getAvatarColor = (id = '') => {
    const index = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
    return avatarColors[index];
  };

  const handleUserClick = (chatUser) => {
    setCurrentChat(chatUser._id, chatUser);
    setSearchQuery('');
  };

  return (
    <aside className={`flex w-full shrink-0 flex-col bg-white lg:w-[360px] lg:border-l lg:border-slate-200`}>
      <header className="shrink-0 border-b border-slate-100 bg-white">
        <ProfilePanel onUpdated={() => { /* noop for now */ }} />
        <div className="px-4 pb-3">
          <div className="flex h-11 items-center gap-2 rounded-xl bg-[#f2f5f8] px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0a9fec]/25">
            <span className="text-lg text-slate-400">⌕</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="جستجو با نام یا @شناسه"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {isSearching && (
              <span className="text-xs text-slate-400">...</span>
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

        {!error && displayedUsers.length === 0 && !isSearching && (
          <div className="mx-4 mt-8 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7ff] text-2xl">💬</div>
            <p className="font-bold text-slate-800">
              {searchQuery.trim() ? 'کاربری یافت نشد' : 'گفتگویی پیدا نشد'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery.trim() ? 'جستجوی دیگری امتحان کنید' : 'برای شروع، کاربری را جستجو کنید'}
            </p>
          </div>
        )}

        {displayedUsers.map((chatUser) => (
          <button
            key={chatUser._id}
            type="button"
            onClick={() => handleUserClick(chatUser)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-right transition ${
              currentChat === chatUser._id ? 'bg-[#eaf7ff]' : 'hover:bg-[#f7f9fb]'
            }`}
          >
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getAvatarColor(chatUser._id)} text-lg font-black text-white`}>
              {getInitial(chatUser.displayName || chatUser.username)}
              <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-[#35c759]" />
            </div>

            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">
                  {chatUser.displayName || chatUser.username}
                </h2>
                <span className="shrink-0 text-[11px] text-slate-400">اکنون</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
                  {chatUser.customId ? `@${chatUser.customId}` : chatUser.bio || 'برای شروع گفتگو ضربه بزنید'}
                </p>
                {currentChat === chatUser._id && <span className="h-2 w-2 rounded-full bg-[#0a9fec]" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
