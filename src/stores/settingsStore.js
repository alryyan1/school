var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// src/stores/settingsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
var initialState = {
    activeSchoolId: null,
    activeAcademicYearId: null,
};
export var useSettingsStore = create()(
// Persist middleware to save to localStorage
persist(function (set) { return (__assign(__assign({}, initialState), { setActiveSchoolId: function (schoolId) {
        set(function (state) {
            // If school is cleared, also clear the dependent academic year
            var newYearId = schoolId === null ? null : state.activeAcademicYearId;
            // Note: We might need extra logic here or in the component
            // to ensure the currently selected year *belongs* to the new school.
            // For now, we only clear it if the school is cleared entirely.
            return { activeSchoolId: schoolId, activeAcademicYearId: newYearId };
        });
    }, setActiveAcademicYearId: function (yearId) {
        set({ activeAcademicYearId: yearId });
    }, clearSettings: function () {
        set(initialState);
        // Note: persist middleware might automatically clear localStorage
        // or you might need localStorage.removeItem('settings-storage') if using manual clear outside reset
    } })); }, {
    name: "general-settings-storage", // Name of the item in localStorage
    storage: createJSONStorage(function () { return localStorage; }), // Use localStorage
    // Optionally: Specify which parts of the state to persist
    // partialize: (state) => ({
    //   activeSchoolId: state.activeSchoolId,
    //   activeAcademicYearId: state.activeAcademicYearId
    // }),
}));
// Optional: Immediately load settings on app start (can also be done in a top-level component)
// useSettingsStore.persist.rehydrate(); // Loads state from storage
