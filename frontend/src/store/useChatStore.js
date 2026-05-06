import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  currentChat: null,
  currentChatUser: null,
  setCurrentChat: (userId, chatUser = null) => set({ currentChat: userId, currentChatUser: chatUser, messages: [] }),
  closeCurrentChat: () => set({ currentChat: null, currentChatUser: null, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    const senderId = typeof message.sender === 'object' ? message.sender?._id : message.sender;
    const receiverId = typeof message.receiver === 'object' ? message.receiver?._id : message.receiver;
    const belongsToCurrentChat = state.currentChat && [senderId, receiverId].includes(state.currentChat);

    if (!belongsToCurrentChat) {
      return state;
    }

    if (message._id && state.messages.some((existingMessage) => existingMessage._id === message._id)) {
      return state;
    }

    return { messages: [...state.messages, message] };
  })
}));
