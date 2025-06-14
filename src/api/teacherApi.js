import axiosClient from "@/axios-client";
import { createTeacherFormData, } from "@/types/teacher";
export var TeacherApi = {
    getAll: function (page) {
        if (page === void 0) { page = 1; }
        return axiosClient.get("/teachers?page=".concat(page));
    },
    getById: function (id) { return axiosClient.get("/teachers/".concat(id)); },
    create: function (teacher) {
        var formData = createTeacherFormData(teacher);
        return axiosClient.post("/teachers", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    update: function (id, teacher) {
        var formData = createTeacherFormData(teacher); // Cast needed? Review data partial nature
        // IMPORTANT: For file uploads with PUT/PATCH, use POST and add _method field
        formData.append("_method", "PUT"); // Or 'PATCH' depending on backend route definition
        return axiosClient.post("/teachers/".concat(id), formData, {
            // Use POST for FormData
            headers: { "Content-Type": "multipart/form-data" },
        });
        // If not handling files, standard PUT works:
        // axiosClient.put<Teacher>(`/teachers/${id}`, teacher)
    },
    delete: function (id) { return axiosClient.delete("/teachers/".concat(id)); },
    // --- NEW ---
    getAssignedSubjects: function (teacherId) {
        return axiosClient.get("/teachers/".concat(teacherId, "/subjects"));
    },
    updateAssignedSubjects: function (teacherId, subjectIds) {
        // Send the array of IDs under the key 'subject_ids'
        return axiosClient.put("/teachers/".concat(teacherId, "/subjects"), { subject_ids: subjectIds });
    },
};
