
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/contexts/ThemeContext';
// import { useAuth } from "@/contexts/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal = ({ open, onOpenChange }: UserProfileModalProps) => {
  // const { user, isLoggedIn, signOut } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme();

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
    <>
    
    </>
  );
};

export default UserProfileModal;
