// src/utils/validators.ts
/**
 * Validates that a string contains only Arabic characters and spaces
 * @param value The string to validate
 * @returns true if valid, error message if invalid
 */
export var validateArabicName = function (value) {
    var arabicRegex = /^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/;
    return arabicRegex.test(value) || "يجب إدخال اسم عربي صحيح";
};
/**
 * Validates Syrian phone numbers (10 digits starting with 09 or +963)
 * @param value The phone number to validate
 * @returns true if valid, error message if invalid
 */
export var validatePhoneNumber = function (value) {
    var tenDigitsRegex = /^\d{10}$/;
    return tenDigitsRegex.test(value) || "يجب إدخال رقم هاتف صحيح من 10 أرقام";
};
/**
 * Validates that a string contains a minimum number of words
 * @param min Minimum number of words required
 * @returns Validation function
 */
export var validateMinimumWords = function (min) { return function (value) {
    var words = value.trim().split(/\s+/).filter(Boolean);
    return words.length >= min || "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 ".concat(min, " \u0643\u0644\u0645\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
}; };
/**
 * Validates email format (optional field)
 * @param value The email to validate
 * @returns true if valid or empty, error message if invalid
 */
export var validateEmail = function (value) {
    if (!value)
        return true; // Optional field
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || "بريد إلكتروني غير صحيح";
};
/**
 * Validates date is in the past and student is at least 3 years old
 * @param value The date string (YYYY-MM-DD)
 * @returns true if valid, error message if invalid
 */
export var validateBirthDate = function (value) {
    var today = new Date();
    var birthDate = new Date(value);
    var age = today.getFullYear() - birthDate.getFullYear();
    if (isNaN(birthDate.getTime()))
        return "تاريخ غير صحيح";
    if (birthDate > today)
        return "لا يمكن أن يكون تاريخ الميلاد في المستقبل";
    if (age < 3)
        return "يجب أن يكون عمر الطالب 3 سنوات على الأقل";
    return true;
};
/**
 * Validates percentage format (0-100)
 * @param value The percentage string
 * @returns true if valid, error message if invalid
 */
export var validatePercentage = function (value) {
    if (!value)
        return true; // Optional field
    var percentage = parseFloat(value);
    return (!isNaN(percentage) && percentage >= 0 && percentage <= 100)
        || "يجب إدخال نسبة بين 0 و 100";
};
/**
 * Validates government ID format (optional)
 * @param value The ID to validate
 * @returns true if valid or empty, error message if invalid
 */
export var validateGovernmentId = function (value) {
    if (!value)
        return true; // Optional field
    var idRegex = /^\d{11}$/;
    return idRegex.test(value) || "يجب إدخال رقم هوية مكون من 11 رقمًا";
};
// Export all validators
export default {
    validateArabicName: validateArabicName,
    validatePhoneNumber: validatePhoneNumber,
    validateMinimumWords: validateMinimumWords,
    validateEmail: validateEmail,
    validateBirthDate: validateBirthDate,
    validatePercentage: validatePercentage,
    validateGovernmentId: validateGovernmentId
};
