// src/hooks/useUserPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/components/UserPreferencesDialog';

const defaultPreferences: UserPreferences = {
  fontSize: 16,
  darkTheme: false,
  fontFamily: 'cairo',
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
        // Load known preferences with fallbacks
        const validPrefs: UserPreferences = {
          fontSize: parsedPrefs.fontSize || defaultPreferences.fontSize,
          darkTheme: parsedPrefs.darkTheme || defaultPreferences.darkTheme,
          fontFamily: parsedPrefs.fontFamily || defaultPreferences.fontFamily,
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
      // Persist supported preferences
      const preferencesToSave: UserPreferences = {
        fontSize: newPreferences.fontSize,
        darkTheme: newPreferences.darkTheme,
        fontFamily: newPreferences.fontFamily || defaultPreferences.fontFamily,
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

    // Apply font family via CSS variable so it cascades everywhere
    const resolvedFontStack =
      prefs.fontFamily === 'tajawal'
        ? '"Tajawal", Cairo, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'
        : '"Cairo", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
    document.documentElement.style.setProperty('--app-font', resolvedFontStack);

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
