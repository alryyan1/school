import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { useSnackbar } from 'notistack';

const StudentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'name'>('name');
  const [isSearching, setIsSearching] = useState(false);
  const { searchStudentById, searchStudentsByName } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      enqueueSnackbar('الرجاء إدخال مصطلح البحث', { variant: 'warning' });
      return;
    }

    setIsSearching(true);
    try {
      if (searchType === 'id') {
        const studentId = parseInt(searchTerm.trim());
        if (isNaN(studentId)) {
          enqueueSnackbar('الرجاء إدخال رقم صحيح', { variant: 'error' });
          return;
        }
        
        const student = await searchStudentById(studentId);
        if (student) {
          navigate(`/students/${student.id}`);
          setSearchTerm('');
        } else {
          enqueueSnackbar('لم يتم العثور على طالب بهذا الرقم', { variant: 'error' });
        }
      } else {
        // Search by name
        const students = await searchStudentsByName(searchTerm.trim());
        if (students && students.length > 0) {
          if (students.length === 1) {
            // If only one result, navigate directly
            navigate(`/students/${students[0].id}`);
            setSearchTerm('');
          } else {
            // If multiple results, navigate to student list with search filter
            navigate(`/students?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
          }
        } else {
          enqueueSnackbar('لم يتم العثور على طالب بهذا الاسم', { variant: 'error' });
        }
      }
    } catch (error) {
      enqueueSnackbar('حدث خطأ أثناء البحث', { variant: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceholder = () => {
    return searchType === 'id' ? 'بحث برقم الطالب...' : 'بحث باسم الطالب...';
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={getPlaceholder()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 text-sm"
          disabled={isSearching}
        />
        {isSearching && (
          <Loader2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      <Select value={searchType} onValueChange={(value: 'id' | 'name') => setSearchType(value)}>
        <SelectTrigger className="w-20 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">الاسم</SelectItem>
          <SelectItem value="id">الرقم</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        type="submit" 
        size="sm" 
        variant="outline" 
        disabled={isSearching || !searchTerm.trim()}
        className="h-9 flex-shrink-0"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default StudentSearch;
