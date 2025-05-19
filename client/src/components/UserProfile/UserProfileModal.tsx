
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal = ({ open, onOpenChange }: UserProfileModalProps) => {
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const [userData] = useState({
    name: 'Student Name',
    email: 'student@example.com',
    class: 'Class X',
    avatar: '/placeholder.svg'
  });

  const translations = {
    english: {
      profile: 'User Profile',
      name: 'Name',
      email: 'Email',
      class: 'Class',
      theme: 'Dark Mode',
      language: 'Language',
      english: 'English',
      bengali: 'Bengali'
    },
    bengali: {
      profile: 'ব্যবহারকারী প্রোফাইল',
      name: 'নাম',
      email: 'ইমেইল',
      class: 'শ্রেণী',
      theme: 'ডার্ক মোড',
      language: 'ভাষা',
      english: 'ইংরেজি',
      bengali: 'বাংলা'
    }
  };

  const t = translations[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t.profile}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="bg-tutor-primary text-white text-xl">
              {userData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="w-full space-y-4">
            <div className="space-y-1">
              <Label>{t.name}</Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{userData.name}</div>
            </div>
            
            <div className="space-y-1">
              <Label>{t.email}</Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{userData.email}</div>
            </div>
            
            <div className="space-y-1">
              <Label>{t.class}</Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{userData.class}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="theme-mode">{t.theme}</Label>
                <Moon className="h-4 w-4 text-indigo-400" />
              </div>
              <Switch 
                id="theme-mode" 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="language-select">{t.language}</Label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value as 'english' | 'bengali')}
              >
                <SelectTrigger id="language-select">
                  <SelectValue placeholder={t.language} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">{t.english}</SelectItem>
                  <SelectItem value="bengali">{t.bengali}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
