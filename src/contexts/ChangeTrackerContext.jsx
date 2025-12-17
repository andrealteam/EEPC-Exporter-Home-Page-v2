import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ChangeTrackerContext = createContext();

// Key for localStorage
const STORAGE_KEY = 'eepc_has_changes';

export const useChangeTracker = () => {
  const context = useContext(ChangeTrackerContext);
  if (!context) {
    throw new Error('useChangeTracker must be used within ChangeTrackerProvider');
  }
  return context;
};

export const ChangeTrackerProvider = ({ children }) => {
  // Load initial state from localStorage if available
  const [hasChanges, setHasChanges] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  
  const [sections, setSections] = useState({
    banner: false,
    about: false,
    products: false
  });

  // Save to localStorage whenever hasChanges changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, hasChanges.toString());
  }, [hasChanges]);

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
    // Only check banner, about, and products sections
    const requiredSections = {
      banner: sections.banner,
      about: sections.about,
      products: sections.products
    };
    return Object.values(requiredSections).every(Boolean);
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
