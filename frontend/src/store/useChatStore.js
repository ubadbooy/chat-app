import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  currentChat: null,
  currentChatUser: null,
  setCurrentChat: (userId, chatUser = null) => set({ currentChat: userId, currentChatUser: chatUser, messages: [] }),
  closeCurrentChat: () => set({ currentChat: null, currentChatUser: null, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] }))
}));
