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
  const [isPreviewOrPublishClicked, setIsPreviewOrPublishClicked] = useState(false);

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
    setIsPreviewOrPublishClicked(false);
  }, []);

  const markAsSaved = useCallback(() => {
    // After save, keep hasChanges as true so buttons remain enabled
    // Only disable after Preview/Publish
  }, []);

  const resetAfterPreviewOrPublish = useCallback(() => {
    setHasChanges(false);
    setIsPreviewOrPublishClicked(true);
  }, []);

  const value = {
    hasChanges,
    isPreviewOrPublishClicked,
    markAsChanged,
    markAsSaved,
    resetAfterPreviewOrPublish,
  };

  return (
    <ChangeTrackerContext.Provider value={value}>
      {children}
    </ChangeTrackerContext.Provider>
  );
};

