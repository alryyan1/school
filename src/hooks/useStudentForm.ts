// src/hooks/useStudentForm.ts
import { useState } from "react";
import { Student, Gender } from "@/types/student";
import { StudentApi } from "@/api/studentApi";

export const useStudentForm = (initialData?: Partial<Student>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   
  const handleSubmit = async (data: Omit<Student, "id">) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = initialData?.id
        ? await StudentApi.update(initialData.id, data)
        : await StudentApi.create(data);
      return response.data;
    } catch (err) {
      setError("حدث خطأ أثناء حفظ البيانات");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    initialValues: {
      student_name: "",
      gender: Gender.Male,
      wished_school: null,
      ...initialData
    }
  };
};