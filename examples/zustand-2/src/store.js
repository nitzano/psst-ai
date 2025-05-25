import { create } from 'zustand'

const useStore = create((set, get) => ({
  count: 0,
  users: [],
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  addUser: (user) => set(state => ({ 
    users: [...state.users, user] 
  })),
  getCount: () => get().count,
}))

export default useStore
