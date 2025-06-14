// src/api/academicYearApi.ts
import axiosClient from '../axios-client';
export var AcademicYearApi = {
    // Optional filter by school_id
    getAll: function (schoolId) {
        var params = schoolId ? { school_id: schoolId } : {};
        return axiosClient.get('/academic-years', { params: params });
    },
    getById: function (id) {
        return axiosClient.get("/academic-years/".concat(id));
    },
    create: function (data) {
        return axiosClient.post('/academic-years', data);
    },
    update: function (id, data) {
        return axiosClient.put("/academic-years/".concat(id), data);
    },
    delete: function (id) {
        return axiosClient.delete("/academic-years/".concat(id));
    },
};
