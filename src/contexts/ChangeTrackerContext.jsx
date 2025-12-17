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
    about: false,
    products: false,
    // Add more sections as needed
  });

  // Check if all required sections are complete
  const allSectionsComplete = Object.values(sections).every(Boolean);

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const resetAfterPreviewOrPublish = useCallback(() => {
    setHasChanges(false);
  }, []);

  const updateSectionStatus = useCallback((sectionName, isComplete) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: isComplete
    }));  
  }, []);

  // Re-enable Preview/Publish after any text edit anywhere in the draft UI
  useEffect(() => {
    const handleAnyEdit = () => {
      setHasChanges(true);
    };

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

  return (
    <ChangeTrackerContext.Provider value={{
      hasChanges,
      allSectionsComplete,
      markAsChanged,
      resetAfterPreviewOrPublish,
      updateSectionStatus,
    }}>
      {children}
    </ChangeTrackerContext.Provider>
  );
};
