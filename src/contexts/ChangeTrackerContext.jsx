import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  const [sections, setSections] = useState({
    banner: false,
    about: false,
    whoWeAre: false,
    products: false
  });

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const resetAfterPreviewOrPublish = useCallback(() => {
    setHasChanges(false);
  }, []);

  const updateSectionStatus = useCallback((section, isComplete) => {
    setSections(prev => ({
      ...prev,
      [section]: isComplete
    }));    
  }, []);

  // Re-enable Preview/Publish after any text edit anywhere in the draft UI.
  useEffect(() => {
    const handleAnyEdit = () => setHasChanges(true);

    const events = ['input', 'change', 'keyup', 'paste'];
    events.forEach((evt) =>
      document.addEventListener(evt, handleAnyEdit, true)
    );

    return () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, handleAnyEdit, true)
      );
    };
  }, []);

  // Check if all required sections are completed
  const areAllSectionsComplete = useCallback(() => {
    return Object.values(sections).every(Boolean);
  }, [sections]);

  return (
    <ChangeTrackerContext.Provider value={{
      hasChanges,
      markAsChanged,
      resetAfterPreviewOrPublish,
      updateSectionStatus,
      areAllSectionsComplete,
      sections
    }}>
      {children}
    </ChangeTrackerContext.Provider>
  );
};
