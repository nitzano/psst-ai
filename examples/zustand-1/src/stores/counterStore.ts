import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(
  subscribeWithSelector((set, get) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }))
);

// Subscribe to changes
useCounterStore.subscribe(
  (state) => state.count,
  (count) => {
    console.log("Count changed to:", count);
  }
);
