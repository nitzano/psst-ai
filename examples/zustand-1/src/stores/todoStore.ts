import { create } from "zustand";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  fetchTodos: () => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  addTodo: (text) => {
    const newTodo: Todo = {
      id: Math.random().toString(36),
      text,
      completed: false,
    };
    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  },

  removeTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));
  },

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockTodos: Todo[] = [
        { id: "1", text: "Learn Zustand", completed: false },
        { id: "2", text: "Build awesome app", completed: false },
      ];
      set({ todos: mockTodos, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch todos",
        isLoading: false,
      });
    }
  },
}));
