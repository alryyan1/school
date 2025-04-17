// src/stores/settingsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  activeSchoolId: number | null;
  activeAcademicYearId: number | null;
  // Add other general settings later if needed
}

interface SettingsActions {
  setActiveSchoolId: (schoolId: number | null) => void;
  setActiveAcademicYearId: (yearId: number | null) => void;
  clearSettings: () => void;
}

const initialState: SettingsState = {
  activeSchoolId: null,
  activeAcademicYearId: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  // Persist middleware to save to localStorage
  persist(
    (set) => ({
      ...initialState,

      setActiveSchoolId: (schoolId) => {
        set((state) => {
          // If school is cleared, also clear the dependent academic year
          const newYearId =
            schoolId === null ? null : state.activeAcademicYearId;
          // Note: We might need extra logic here or in the component
          // to ensure the currently selected year *belongs* to the new school.
          // For now, we only clear it if the school is cleared entirely.
          return { activeSchoolId: schoolId, activeAcademicYearId: newYearId };
        });
      },

      setActiveAcademicYearId: (yearId) => {
        set({ activeAcademicYearId: yearId });
      },

      clearSettings: () => {
        set(initialState);
        // Note: persist middleware might automatically clear localStorage
        // or you might need localStorage.removeItem('settings-storage') if using manual clear outside reset
      },
    }),
    {
      name: "general-settings-storage", // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // Optionally: Specify which parts of the state to persist
      // partialize: (state) => ({
      //   activeSchoolId: state.activeSchoolId,
      //   activeAcademicYearId: state.activeAcademicYearId
      // }),
    }
  )
);

// Optional: Immediately load settings on app start (can also be done in a top-level component)
// useSettingsStore.persist.rehydrate(); // Loads state from storage
