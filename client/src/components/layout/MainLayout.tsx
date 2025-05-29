import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import { Bot, FileArchiveIcon, Home, Inbox } from 'lucide-react';
import UserProfileModal from '../UserProfile/UserProfileModal';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext"
import google_img from "@/assets/google.png"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Logo from "@/assets/brandLogo.png"
import { Link } from 'react-router-dom';
import tutormentor from '@/assets/tutor-mentor.png'

interface MainLayoutProps {
  children: React.ReactNode;
}

const translations = {
  english: {
    home: 'Home',
    drive: 'Drive',
    tests: 'Tests',
    tutorAi: 'Tutor AI',
    about: 'About',
    signIn: 'Sign In'
  },
  bengali: {
    home: 'হোম',
    drive: 'ড্রাইভ',
    tests: 'পরীক্ষা',
    tutorAi: 'টিউটর এআই',
    about: 'সম্পর্কে',
    signIn: 'সাইন ইন'
  }
};

const MainLayoutContent = ({ children }: MainLayoutProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isLoggedIn, signIn } = useAuth();
  const { language } = useTheme();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 font-poppins">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className='flex items-end gap-2 flex-row'>
              <img src={Logo} alt="" className='h-8 w-8 dark:invert mb-1' />
              <div className='pt-2'>
                <h1 className="text-2xl text-black dark:text-white">TutorMentor</h1>
              </div>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <div className='md:flex items-center gap-8 hidden'>
              <Link to="/" className='flex items-center hover:text-tutor-primary gap-1'><Home className='h-4 w-4' /> {t.home}</Link>
              <Link to="/drive" className='flex items-center hover:text-tutor-primary gap-1'><Inbox className='h-4 w-4' /> {t.drive}</Link>
              <Link to="/tests" className='flex items-center hover:text-tutor-primary gap-1'><FileArchiveIcon className='h-4 w-4' /> {t.tests}</Link>
              <Link to="/tutor-ai" className='flex items-center hover:text-tutor-primary gap-1'><Bot className="h-4 w-4" /> {t.tutorAi}</Link>
              <Link to="/about" className='flex items-center hover:text-tutor-primary gap-1'><img src={tutormentor} alt="" className='h-5 w-5 dark:invert' /> {t.about}</Link>
            </div>
            {
              isLoggedIn ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-tutor-primary text-white text-xl">
                      {user?.displayName ? user.displayName.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

              ) : (
                <button className='flex items-center p-2 border lounded-lg'>
                  <img src={google_img} alt="Google" className="w-4 h-4 mr-2" />
                  <span onClick={signIn} className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.signIn}</span>
                </button>
              )
            }
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <MobileNavigation />

      <UserProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ThemeProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
    </ThemeProvider>
  );
};

export default MainLayout;
