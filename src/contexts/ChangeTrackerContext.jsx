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
