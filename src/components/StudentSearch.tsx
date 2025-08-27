import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { useSnackbar } from 'notistack';

const StudentSearch: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchStudentById } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchId.trim()) {
      enqueueSnackbar('الرجاء إدخال رقم الطالب', { variant: 'warning' });
      return;
    }

    const studentId = parseInt(searchId.trim());
    if (isNaN(studentId)) {
      enqueueSnackbar('الرجاء إدخال رقم صحيح', { variant: 'error' });
      return;
    }

    setIsSearching(true);
    try {
      const student = await searchStudentById(studentId);
      if (student) {
        navigate(`/students/${student.id}`);
        setSearchId('');
      } else {
        enqueueSnackbar('لم يتم العثور على طالب بهذا الرقم', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('حدث خطأ أثناء البحث', { variant: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="بحث برقم الطالب..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full h-9 text-sm"
          disabled={isSearching}
        />
        {isSearching && (
          <Loader2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <Button 
        type="submit" 
        size="sm" 
        variant="outline" 
        disabled={isSearching || !searchId.trim()}
        className="h-9 flex-shrink-0"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default StudentSearch;
