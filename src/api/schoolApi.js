// src/api/schoolApi.ts
import axiosClient from "../axios-client";
// Helper to create FormData (can be reused or adapted from teacherApi)
var createSchoolFormData = function (schoolData) {
    var formData = new FormData();
    Object.keys(schoolData).forEach(function (key) {
        var value = schoolData[key];
        if (key !== "logo" && value !== null && value !== undefined) {
            formData.append(key, value);
        }
    });
    if (schoolData.logo instanceof File) {
        // Ensure it's a File
        formData.append("logo", schoolData.logo);
    }
    return formData;
};
export var SchoolApi = {
    // No longer expects page parameter, returns array directly
    getAll: function () { return axiosClient.get("/schools"); }, // Expect { data: [...] } wrapper from ResourceCollection
    getById: function (id) { return axiosClient.get("/schools/".concat(id)); }, // Expect { data: {...} } wrapper from Resource
    create: function (school) {
        var formData = createSchoolFormData(school);
        return axiosClient.post("/schools", formData, {
            // Expect { data: {...} }
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    update: function (id, school) {
        var formData = createSchoolFormData(school);
        formData.append("_method", "PUT");
        return axiosClient.post("/schools/".concat(id), formData, {
            // Expect { data: {...} }
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    delete: function (id) { return axiosClient.delete("/schools/".concat(id)); }, // No data expected on success (200/204)
    // --- NEW ---
    getAssignedGradeLevels: function (schoolId) {
        // Returns { data: GradeLevel[] }
        return axiosClient.get("/schools/".concat(schoolId, "/grade-levels"));
    },
    updateAssignedGradeLevels: function (schoolId, gradeLevelIds) {
        // Send { grade_level_ids: [1, 2, 5] }
        return axiosClient.put("/schools/".concat(schoolId, "/grade-levels"), {
            grade_level_ids: gradeLevelIds,
        });
    },
    // --- UPDATED/NEW Grade Level Assignment Methods ---
    // Assign NEW grade levels (accepts array)
    attachGradeLevels: function (schoolId, grade_level_id, basic_fees) {
        return axiosClient.post("/schools/".concat(schoolId, "/grade-levels"), { grade_level_id: grade_level_id, basic_fees: basic_fees });
    }, // Send array under 'assignments' key
    // Update fee for ONE existing assignment
    updateGradeLevelFee: function (schoolId, gradeLevelId, basic_fees) {
        return axiosClient.put("/schools/".concat(schoolId, "/grade-levels/").concat(gradeLevelId), { basic_fees: basic_fees });
    },
    // Unassign ONE grade level
    detachGradeLevel: function (schoolId, gradeLevelId) {
        return axiosClient.delete("/schools/".concat(schoolId, "/grade-levels/").concat(gradeLevelId));
    },
};
