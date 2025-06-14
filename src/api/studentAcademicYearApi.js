// src/api/studentAcademicYearApi.ts
import axiosClient from "../axios-client";
export var StudentAcademicYearApi = {
    // Get enrollments for a specific year and grade/classroom
    getAll: function (filters) {
        return axiosClient.get("/student-enrollments", {
            params: filters,
        });
    },
    // Get students not enrolled in a specific year
    getEnrollableStudents: function (academicYearId, schoolId) {
        return axiosClient.get("/enrollable-students", {
            params: { academic_year_id: academicYearId, school_id: schoolId },
        });
    },
    // Enroll a student
    create: function (data) {
        return axiosClient.post("/student-enrollments", data);
    },
    // Update classroom/status
    update: function (id, data) {
        return axiosClient.put("/student-enrollments/".concat(id), data);
    },
    // Unenroll a student
    delete: function (id) { return axiosClient.delete("/student-enrollments/".concat(id)); },
    // --- NEW SEARCH FUNCTION ---
    search: function (searchTerm) {
        return axiosClient.get("search", {
            params: { term: searchTerm },
        });
    },
    getAllStudentAcademicYear: function () {
        return axiosClient.get('getAllStudentAcademicYear');
    }
};
