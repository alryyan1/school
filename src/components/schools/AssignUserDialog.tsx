// src/components/schools/AssignUserDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserApi } from "@/api/userApi";
import { SchoolApi } from "@/api/schoolApi";
import type { User } from "@/types/user";
import type { School } from "@/types/school";
import { useSnackbar } from "notistack";
import { Loader2, AlertCircle } from "lucide-react";

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onUserAssigned: () => void;
}

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  open,
  onOpenChange,
  school,
  onUserAssigned,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
      // Set current user if school has one
      if (school?.user_id) {
        setSelectedUserId(school.user_id.toString());
      } else {
        setSelectedUserId('');
      }
    }
  }, [open, school]);

  const loadUsers = async () => {
    setUsersLoading(true);
    setError('');
    try {
      const response = await UserApi.getAll(1, {});
      setUsers(response.data.data || []);
    } catch (err) {
      setError('فشل في تحميل قائمة المستخدمين');
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!school || !selectedUserId) {
      enqueueSnackbar('يرجى اختيار مستخدم', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Update the school with the selected user
      await SchoolApi.update(school.id, {
        user_id: parseInt(selectedUserId)
      });

      enqueueSnackbar('تم تعيين المستخدم للمدرسة بنجاح', { variant: 'success' });
      onUserAssigned();
      onOpenChange(false);
    } catch (err) {
      enqueueSnackbar('فشل في تعيين المستخدم للمدرسة', { variant: 'error' });
      console.error('Error assigning user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!school) return;

    setLoading(true);
    try {
      await SchoolApi.unassignUser(school.id);

      enqueueSnackbar('تم إلغاء تعيين المستخدم من المدرسة بنجاح', { variant: 'success' });
      onUserAssigned();
      onOpenChange(false);
    } catch (err) {
      enqueueSnackbar('فشل في إلغاء تعيين المستخدم من المدرسة', { variant: 'error' });
      console.error('Error removing user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعيين مستخدم للمدرسة</DialogTitle>
          <DialogDescription>
            {school && (
              <>
                تعيين مستخدم كمدير للمدرسة: <strong>{school.name}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="user-select">اختر المستخدم</Label>
            {usersLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستخدم..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">بدون مستخدم</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {school?.user && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                المستخدم الحالي: <strong>{school.user.name}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          
          {school?.user_id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveUser}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  إلغاء التعيين
                </>
              ) : (
                'إلغاء التعيين'
              )}
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleAssignUser}
            disabled={loading || !selectedUserId}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                تعيين
              </>
            ) : (
              'تعيين'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog; 