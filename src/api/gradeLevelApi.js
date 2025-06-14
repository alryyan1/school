// src/api/gradeLevelApi.ts
import axiosClient from '../axios-client';
export var GradeLevelApi = {
    getAll: function () {
        return axiosClient.get('/grade-levels');
    },
    getById: function (id) {
        return axiosClient.get("/grade-levels/".concat(id));
    },
    create: function (data) {
        return axiosClient.post('/grade-levels', data);
    },
    update: function (id, data) {
        return axiosClient.put("/grade-levels/".concat(id), data);
    },
    delete: function (id) {
        return axiosClient.delete("/grade-levels/".concat(id));
    },
};
