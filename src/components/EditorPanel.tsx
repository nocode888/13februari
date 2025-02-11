import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Save, Trash2 } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface EditorPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const { content, isSaved, setContent, setSaved, clearContent } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Show temporary success state
      const button = document.querySelector('[data-copy-button]');
      if (button) {
        button.classList.add('text-green-600');
        setTimeout(() => {
          button.classList.remove('text-green-600');
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    setSaved(true);
    // Show temporary success state
    const button = document.querySelector('[data-save-button]');
    if (button) {
      button.classList.add('text-green-600');
      setTimeout(() => {
        button.classList.remove('text-green-600');
      }, 1000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      clearContent();
    }
  };

  return (
    <div className={`fixed top-16 bottom-0 right-0 bg-white border-l border-gray-200 transition-all duration-300 z-10 ${
      isCollapsed ? 'w-[60px]' : 'w-[400px]'
    }`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-50"
        aria-label={isCollapsed ? "Expand editor" : "Collapse editor"}
      >
        {isCollapsed ? (
          <ChevronLeft size={18} className="text-gray-600" />
        ) : (
          <ChevronRight size={18} className="text-gray-600" />
        )}
      </button>

      {/* Editor Content */}
      <div className={`h-full flex flex-col transition-opacity duration-300 ${
        isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Editor</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                data-copy-button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={handleSave}
                data-save-button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Save content"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear editor"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none editor-panel"
            placeholder="Content from AI responses will appear here..."
          />
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{content.length} characters</span>
            {isSaved && <span className="text-green-600">Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
};