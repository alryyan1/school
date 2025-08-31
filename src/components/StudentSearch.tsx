import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { Search } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { useSnackbar } from 'notistack';
import { Student } from '@/types/student';
import { debounce } from 'lodash';

const StudentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'name'>('name');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const { searchStudentById, searchStudentsByName } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        if (searchType === 'name') {
          const students = await searchStudentsByName(query.trim());
          setSearchResults(students);
        } else {
          // For ID search, we'll handle it differently
          const studentId = parseInt(query.trim());
          if (!isNaN(studentId)) {
            const student = await searchStudentById(studentId);
            setSearchResults(student ? [student] : []);
          } else {
            setSearchResults([]);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchType, searchStudentById, searchStudentsByName]
  );

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleOptionSelect = (student: Student | null) => {
    if (student) {
      navigate(`/students/${student.id}`);
      setSearchTerm('');
      setSearchResults([]);
      setOpen(false);
    }
  };

  const handleInputChange = (event: React.SyntheticEvent, value: string) => {
    setSearchTerm(value);
  };

  const getOptionLabel = (option: Student) => {
    return `${option.student_name} - ${option.student_id}`;
  };

  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: Student) => (
    <li {...props} key={option.id}>
      <div className="flex flex-col">
        <span className="font-medium">{option.student_name}</span>
        <span className="text-sm text-muted-foreground">رقم الطالب: {option.student_id}</span>
      </div>
    </li>
  );

  const getPlaceholder = () => {
    return searchType === 'id' ? 'بحث برقم الطالب...' : 'بحث باسم الطالب...';
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          options={searchResults}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          loading={isSearching}
          value={null}
          onChange={(event, newValue) => handleOptionSelect(newValue)}
          onInputChange={handleInputChange}
          inputValue={searchTerm}
          noOptionsText="لا توجد نتائج"
          loadingText="جاري البحث..."
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={getPlaceholder()}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '36px',
                  fontSize: '14px',
                },
                '& .MuiInputBase-input': {
                  padding: '8px 12px',
                },
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          filterOptions={(x) => x} // Disable built-in filtering since we're doing server-side search
        />
      </div>
      
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSearchType(searchType === 'name' ? 'id' : 'name')}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          {searchType === 'name' ? 'الاسم' : 'الرقم'}
        </button>
      </div>
    </div>
  );
};

export default StudentSearch;
