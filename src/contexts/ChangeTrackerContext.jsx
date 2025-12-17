import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ChangeTrackerContext = createContext();

export const useChangeTracker = () => {
  const context = useContext(ChangeTrackerContext);
  if (!context) {
    throw new Error('useChangeTracker must be used within ChangeTrackerProvider');
  }
  return context;
};

// Helper function to load sections from localStorage
const loadSections = () => {
  try {
    const savedSections = localStorage.getItem('sectionCompletion');
    return savedSections 
      ? JSON.parse(savedSections) 
      : {
          banner: false,
          about: false,
          products: false
        };
  } catch (error) {
    console.error('Failed to load sections from localStorage', error);
    return {
      banner: false,
      about: false,
      products: false
    };
  }
};

export const ChangeTrackerProvider = ({ children }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [sections, setSections] = useState(loadSections());
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMadeChanges, setHasMadeChanges] = useState(false);

  const markAsChanged = useCallback(() => {
    if (initialLoad) {
      setInitialLoad(false);
    }
    setHasChanges(true);
    setHasMadeChanges(true);
  }, [initialLoad]);

  const resetAfterPreviewOrPublish = useCallback(() => {
    setHasChanges(false);
    setHasMadeChanges(false);
    // Save the current sections state to preserve completion status
    localStorage.setItem('sectionCompletion', JSON.stringify(sections));
  }, [sections]);

  const updateSectionStatus = useCallback((section, isComplete) => {
    setSections(prev => {
      const newSections = {
        ...prev,
        [section]: isComplete
      };
      // Save to localStorage whenever sections are updated
      localStorage.setItem('sectionCompletion', JSON.stringify(newSections));
      return newSections;
    });    
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
      hasMadeChanges,
      markAsChanged,
      resetAfterPreviewOrPublish,
      initialLoad,
      updateSectionStatus,
      areAllSectionsComplete,
      sections
    }}>
      {children}
    </ChangeTrackerContext.Provider>
  );
};
