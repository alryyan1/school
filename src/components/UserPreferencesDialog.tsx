// src/components/UserPreferencesDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Type, 
  Palette, 
  Save, 
  RotateCcw
} from "lucide-react";
import { useSnackbar } from "notistack";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export interface UserPreferences {
  // Font settings
  fontSize: number;
  fontFamily?: 'cairo' | 'tajawal';
  
  // Theme settings
  darkTheme: boolean;
}

interface UserPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserPreferencesDialog: React.FC<UserPreferencesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { preferences, savePreferences, resetPreferences } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    fontSize: preferences.fontSize || 16,
    fontFamily: preferences.fontFamily || 'cairo',
    darkTheme: preferences.darkTheme || false,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local preferences with global preferences when dialog opens
  useEffect(() => {
    if (open) {
      setLocalPreferences({
        fontSize: preferences.fontSize || 16,
        fontFamily: preferences.fontFamily || 'cairo',
        darkTheme: preferences.darkTheme || false,
      });
      setHasChanges(false);
    }
  }, [open, preferences]);

  // Check if preferences have changed
  useEffect(() => {
    const currentPrefs = {
      fontSize: preferences.fontSize || 16,
      fontFamily: preferences.fontFamily || 'cairo',
      darkTheme: preferences.darkTheme || false,
    };
    setHasChanges(
      localPreferences.fontSize !== currentPrefs.fontSize ||
      localPreferences.fontFamily !== currentPrefs.fontFamily ||
      localPreferences.darkTheme !== currentPrefs.darkTheme
    );
  }, [localPreferences, preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = savePreferences({
        ...preferences,
        fontSize: localPreferences.fontSize,
        fontFamily: localPreferences.fontFamily || 'cairo',
        darkTheme: localPreferences.darkTheme,
      });
      if (success) {
        enqueueSnackbar('تم حفظ التفضيلات بنجاح', { variant: 'success' });
        
        // Close dialog after short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        enqueueSnackbar('فشل في حفظ التفضيلات', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('فشل في حفظ التفضيلات', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalPreferences({
      fontSize: 16,
      darkTheme: false,
    });
    enqueueSnackbar('تم إعادة تعيين التفضيلات', { variant: 'info' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            تفضيلات المستخدم
          </DialogTitle>
          <DialogDescription>
            قم بتخصيص إعدادات التطبيق حسب تفضيلاتك الشخصية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Font Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                إعدادات الخط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">حجم الخط</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="fontSize"
                    min={12}
                    max={24}
                    step={1}
                    value={[localPreferences.fontSize]}
                    onValueChange={([value]) => setLocalPreferences(prev => ({ ...prev, fontSize: value }))}
                    className="flex-1"
                  />
                  <Badge variant="secondary" className="min-w-[3rem] text-center">
                    {localPreferences.fontSize}px
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontFamily">نوع الخط</Label>
                <Select
                  value={localPreferences.fontFamily || 'cairo'}
                  onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, fontFamily: value as 'cairo' | 'tajawal' }))}
                >
                  <SelectTrigger id="fontFamily" className="w-full">
                    <SelectValue placeholder="اختر الخط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="tajawal">Tajawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                إعدادات المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkTheme">المظهر الداكن</Label>
                <Switch
                  id="darkTheme"
                  checked={localPreferences.darkTheme}
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, darkTheme: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            إعادة تعيين
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التفضيلات
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPreferencesDialog;
