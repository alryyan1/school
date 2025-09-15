// src/utils/validators.ts

/**
 * Validates that a string contains only Arabic characters and spaces
 * @param value The string to validate
 * @returns true if valid, error message if invalid
 */
export const validateArabicName = (value: string): true | string => {
    const arabicRegex = /^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/;
    return arabicRegex.test(value) || "يجب إدخال اسم عربي صحيح";
  };
  
  /**
   * Validates phone numbers: exactly 10 digits
   * @param value The phone number to validate
   * @returns true if valid, error message if invalid
   */
  export const validatePhoneNumber = (value: string): true | string => {
    const tenDigitsRegex = /^\d{10}$/;
    return tenDigitsRegex.test(value) || "يجب إدخال رقم هاتف صحيح من 10 أرقام";
  };
  
  /**
   * Validates that a string contains a minimum number of words
   * @param min Minimum number of words required
   * @returns Validation function
   */
  export const validateMinimumWords = (min: number) => (value: string): true | string => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    return words.length >= min || `يجب إدخال ${min} كلمات على الأقل`;
  };
  
  /**
   * Validates email format (optional field)
   * @param value The email to validate
   * @returns true if valid or empty, error message if invalid
   */
  export const validateEmail = (value: string): true | string => {
    if (!value) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || "بريد إلكتروني غير صحيح";
  };
  
  /**
   * Validates date is in the past and student is at least 3 years old
   * @param value The date string (YYYY-MM-DD)
   * @returns true if valid, error message if invalid
   */
  export const validateBirthDate = (value: string): true | string => {
    const today = new Date();
    const birthDate = new Date(value);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) return "تاريخ غير صحيح";
    if (birthDate > today) return "لا يمكن أن يكون تاريخ الميلاد في المستقبل";
    if (age < 3) return "يجب أن يكون عمر الطالب 3 سنوات على الأقل";
    
    return true;
  };
  
  /**
   * Validates percentage format (0-100)
   * @param value The percentage string
   * @returns true if valid, error message if invalid
   */
  export const validatePercentage = (value: string): true | string => {
    if (!value) return true; // Optional field
    const percentage = parseFloat(value);
    return (!isNaN(percentage) && percentage >= 0 && percentage <= 100) 
      || "يجب إدخال نسبة بين 0 و 100";
  };
  
  /**
   * Validates government ID format (optional)
   * @param value The ID to validate
   * @returns true if valid or empty, error message if invalid
   */
  export const validateGovernmentId = (value: string): true | string => {
    if (!value) return true; // Optional field
    const idRegex = /^\d{11}$/;
    return idRegex.test(value) || "يجب إدخال رقم هوية مكون من 11 رقمًا";
  };
  
  // Export all validators
  export default {
    validateArabicName,
    validatePhoneNumber,
    validateMinimumWords,
    validateEmail,
    validateBirthDate,
    validatePercentage,
    validateGovernmentId
  };