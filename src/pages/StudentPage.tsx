// src/pages/StudentPage.tsx

import { StudentForm } from "@/components/students/studentForm/StudentForm";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const StudentPage: React.FC = () => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
            <StudentForm  />
        </LocalizationProvider>
    );
};

export default StudentPage;