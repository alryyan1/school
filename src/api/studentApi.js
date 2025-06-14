import axiosClient from "../axios-client";
export var StudentApi = {
    create: function (student // Send plain object if no file involved
    ) { return axiosClient.post("/students", student); },
    update: function (id, student // Don't send photo path in normal update
    ) { return axiosClient.put("/students/".concat(id), student); },
    getAll: function () { return axiosClient.get("/students"); },
    getById: function (id) {
        return axiosClient.get("/students/".concat(id));
    },
    delete: function (id) { return axiosClient.delete("/students/".concat(id)); },
    // --- NEW: Update Photo ---
    updatePhoto: function (id, photo) {
        var formData = new FormData();
        formData.append("image", photo);
        // Use POST with _method=PATCH or a dedicated POST route
        formData.append("_method", "POST"); // Or use a dedicated POST route like /students/{id}/photo
        // Adjust endpoint if needed (e.g., '/students/{id}/photo')
        // Laravel often uses POST for FormData updates even if conceptually PATCH/PUT
        return axiosClient.post("/students/".concat(id, "/photo"), formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
