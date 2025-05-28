import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

interface Batch {
  _id: string;
  name: string;
  batchCode: string;
  createdBy: string;
  students: {
    student: string;
    status: string;
    _id: string;
  }[];
  createdAt: string;
  __v: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  status: string;
  recent_files: any[];
  __v: number;
  batch: Batch;
}

interface BatchDetails {
  batchId: string;
  batchName: string;
}

interface ProfileData {
  user: User;
  batchDetails: BatchDetails;
}

const UserProfileModal = ({ open, onOpenChange }: UserProfileModalProps) => {
  const { user, isLoggedIn, signOut } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  const studentId = localStorage.getItem("studentId");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/auth/get-data/${studentId}`)
      .then(res => {
        setProfileData(res.data);
        localStorage.setItem('batchId',res.data.batchDetails.batchId)
      })
      .catch(() => setProfileData(null))
      .finally(() => setLoading(false));
  }, [studentId, open]);

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
     {
      isLoggedIn && (
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white p-2 md:p-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">{t.profile}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-4">
                <div className='flex flex-row gap-4 w-full items-center'>
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-tutor-primary text-white text-xl">
                      {user?.displayName ? user.displayName.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex flex-col w-full'>
                    <div className="space-y-1">
                      <Label>{t.name}</Label>
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{user.displayName || profileData?.user?.name || "User"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t.email}</Label>
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{user.email || profileData?.user?.email || "Email"}</div>
                    </div>

                    <div className="space-y-1">
                      <Label>{t.class}</Label>
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {loading ? "Loading..." : (profileData?.batchDetails?.batchName || "N/A")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="theme-mode">{t.theme}</Label>
                    </div>
                    <Switch
                      id="theme-mode"
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>

                  <div className="space-y-1 flex gap-12 items-center">
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

                  <div className="flex items-center justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Signout from Account</Label>
                    </div>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={signOut}
                    >
                      Sign Out
                    </button>
                  </div>

                </div>
              </div>
              <span className='text-center text-xs'>© 2025 TutorMentor</span>
            </DialogContent>
          </Dialog> 
      )
    }
    </>
  );
};

export default UserProfileModal;
