import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A robust zero-blocking autosave engine for the Live Notes editor.
 * Handles debouncing, offline queueing, and UI status reporting.
 */
export const useAutosave = (noteId, initialContent = '', saveFn) => {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState('saved'); // 'saved', 'saving', 'error', 'offline_draft'
  
  const contentRef = useRef(initialContent);
  const saveTimeoutRef = useRef(null);

  const saveToServer = useCallback(async (currentContent) => {
    if (!navigator.onLine) {
      setStatus('offline_draft');
      return;
    }

    try {
      setStatus('saving');
      // Mock network delay
      await new Promise(res => setTimeout(res, 500));
      if (saveFn) await saveFn(noteId, currentContent);
      setStatus('saved');
    } catch (err) {
      console.error('Autosave failed:', err);
      setStatus('error');
    }
  }, [noteId, saveFn]);

  // Handle local state updates instantly, queue network sync
  const updateContent = (newContent) => {
    setContent(newContent);
    contentRef.current = newContent;
    setStatus('saving'); // Indicate to user that changes are pending

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce network save by 2000ms
    saveTimeoutRef.current = setTimeout(() => {
      saveToServer(contentRef.current);
    }, 2000);
  };

  // Recover from offline when network returns
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline_draft' || status === 'error') {
        saveToServer(contentRef.current);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [status, saveToServer]);

  return { content, updateContent, status };
};
