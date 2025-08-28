// src/stores/settingsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  activeSchoolId: number | null;
  activeAcademicYear: string | null; // Changed from activeAcademicYearId to string
  // Add other general settings later if needed
}

interface SettingsActions {
  setActiveSchoolId: (schoolId: number | null) => void;
  setActiveAcademicYear: (academicYear: string | null) => void; // Changed parameter type
  clearSettings: () => void;
}

const initialState: SettingsState = {
  activeSchoolId: null,
  activeAcademicYear: null, // Changed from activeAcademicYearId
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  // Persist middleware to save to localStorage
  persist(
    (set) => ({
      ...initialState,

      setActiveSchoolId: (schoolId) => {
        set((state) => {
          // If school is cleared, also clear the dependent academic year
          const newAcademicYear =
            schoolId === null ? null : state.activeAcademicYear;
          // Note: We might need extra logic here or in the component
          // to ensure the currently selected year *belongs* to the new school.
          // For now, we only clear it if the school is cleared entirely.
          return { activeSchoolId: schoolId, activeAcademicYear: newAcademicYear };
        });
      },

      setActiveAcademicYear: (academicYear) => { // Changed parameter name
        set({ activeAcademicYear: academicYear });
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
      //   activeAcademicYear: state.activeAcademicYear
      // }),
    }
  )
);

// Optional: Immediately load settings on app start (can also be done in a top-level component)
// useSettingsStore.persist.rehydrate(); // Loads state from storage
