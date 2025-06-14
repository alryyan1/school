// Helper to create FormData
export var createTeacherFormData = function (teacherData) {
    var formData = new FormData();
    // Append all fields except the photo file itself
    Object.keys(teacherData).forEach(function (key) {
        if (key !== 'photo' && teacherData[key] !== null && teacherData[key] !== undefined) {
            // Special handling for boolean `is_active` to send '1' or '0' if needed by backend,
            // otherwise, send directly. Let's assume backend handles true/false correctly.
            // if (key === 'is_active') {
            //    formData.append(key, teacherData[key] ? '1' : '0');
            // } else {
            formData.append(key, teacherData[key]);
            // }
        }
    });
    // Append the photo file if it exists
    if (teacherData.photo) {
        formData.append('photo', teacherData.photo);
    }
    return formData;
};
