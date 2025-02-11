import create from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  content: string;
  isSaved: boolean;
  setContent: (content: string) => void;
  appendContent: (newContent: string) => void;
  clearContent: () => void;
  setSaved: (saved: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      content: '',
      isSaved: false,
      setContent: (content) => set({ content, isSaved: false }),
      appendContent: (newContent) => set((state) => ({
        content: state.content ? `${state.content}\n\n${newContent}` : newContent,
        isSaved: false
      })),
      clearContent: () => set({ content: '', isSaved: false }),
      setSaved: (saved) => set({ isSaved: saved })
    }),
    {
      name: 'editor-storage',
      skipHydration: true
    }
  )
);