// src/hooks/useUserPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/components/UserPreferencesDialog';

const defaultPreferences: UserPreferences = {
  fontSize: 16,
  darkTheme: false,
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const savedPrefs = localStorage.getItem('userPreferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        // Only load fontSize and darkTheme, ignore other properties
        const validPrefs = {
          fontSize: parsedPrefs.fontSize || defaultPreferences.fontSize,
          darkTheme: parsedPrefs.darkTheme || defaultPreferences.darkTheme,
        };
        setPreferences(validPrefs);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      // Only save fontSize and darkTheme
      const preferencesToSave = {
        fontSize: newPreferences.fontSize,
        darkTheme: newPreferences.darkTheme,
      };
      localStorage.setItem('userPreferences', JSON.stringify(preferencesToSave));
      setPreferences(preferencesToSave);
      return true;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      return false;
    }
  }, []);

  // Update a specific preference
  const updatePreference = useCallback((key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Reset preferences to default
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('userPreferences');
  }, []);

  // Apply preferences to document
  const applyPreferences = useCallback((prefs: UserPreferences) => {
    // Apply font size
    document.documentElement.style.fontSize = `${prefs.fontSize}px`;
    
    // Apply dark theme
    if (prefs.darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Apply preferences when they change
  useEffect(() => {
    if (isLoaded) {
      applyPreferences(preferences);
    }
  }, [preferences, isLoaded, applyPreferences]);

  return {
    preferences,
    isLoaded,
    savePreferences,
    updatePreference,
    resetPreferences,
    loadPreferences,
  };
};
