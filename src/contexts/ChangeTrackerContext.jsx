import React, { createContext, useContext, useState, useCallback } from 'react';

const ChangeTrackerContext = createContext();

export const useChangeTracker = () => {
  const context = useContext(ChangeTrackerContext);
  if (!context) {
    throw new Error('useChangeTracker must be used within ChangeTrackerProvider');
  }
  return context;
};

export const ChangeTrackerProvider = ({ children }) => {
  const [hasChanges, setHasChanges] = useState(false);

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const resetAfterPreviewOrPublish = useCallback(() => {
    setHasChanges(false);
  }, []);

  // If the user edits anything on the page after a preview/publish,
  // automatically mark the draft as having changes so the buttons re-enable.
  React.useEffect(() => {
    const handleAnyInput = () => setHasChanges(true);

    window.addEventListener('input', handleAnyInput, { capture: true });
    window.addEventListener('change', handleAnyInput, { capture: true });

    return () => {
      window.removeEventListener('input', handleAnyInput, { capture: true });
      window.removeEventListener('change', handleAnyInput, { capture: true });
    };
  }, []);

  return (
    <ChangeTrackerContext.Provider value={{
      hasChanges,
      markAsChanged,
      resetAfterPreviewOrPublish,
    }}>
      {children}
    </ChangeTrackerContext.Provider>
  );
};
