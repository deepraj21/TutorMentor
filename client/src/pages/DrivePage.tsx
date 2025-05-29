import { useAuth } from '@/contexts/AuthContext';
import FileExplorer from '@/components/FileExplorer/FileExplorer';
import { useState, useEffect } from 'react';
import joingBatchImg from "@/assets/join-batch.webp"
import pendingImg from "@/assets/pending.webp"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import BatchCodeInput from '@/components/BatchCode/BatchCodeInput';
import no_user from "@/assets/no-user.webp"
import google_img from "@/assets/google.png"
import axios from 'axios';

interface UserData {
  _id: string;
  name: string;
  email: string;
  status: string;
  recent_files: any[];
  __v: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const DrivePage = () => {
  const { user, isLoggedIn, signIn } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const studentId = localStorage.getItem("studentId");
        if (isLoggedIn && user && (user.email || studentId)) {
          const userDataResponse = await axios.get(`${BACKEND_URL}/api/auth/get-data/${studentId}`);
          setUserData(userDataResponse.data.user);
        }
      } catch (error) {
        setUserData(null);
      }
    };

    if (isLoggedIn && user) {
      fetchUserData();
    }
  }, [isLoggedIn, user]);

  return (
    <>
      {
        isLoggedIn ? (
          <div className="container mx-auto pb-10">
            {userData?.status === "NoBatch" && (
              <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                <img src={joingBatchImg} />
                <Dialog>
                  <DialogTrigger asChild>
                    <button className='flex gap-2 items-center border p-2 rounded-lg'>
                      Join Batch Now
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white">
                    <DialogTitle>Join Batch</DialogTitle>
                    <BatchCodeInput
                      studentId={userData?._id}
                      onSuccess={() => {
                        window.location.reload();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {
              userData?.status === "Pending" && (
                <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                  <img src={pendingImg} />
                  <p className='text-gray-900 dark:text-gray-200 bg-yellow-600/50 p-1 pl-2 pr-2  rounded-full'>Approval pending</p>
                </div>
              )
            }
            {
              userData?.status === "Rejected" && (
                <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                  <img src={pendingImg} />
                  <p className="text-gray-500 dark:text-gray-400">Your request has been rejected. Please contact support.</p>
                </div>
              )
            }

            {
              userData?.status == "Accepted" && (
                <div className="min-h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 w-full">
                  <FileExplorer />
                </div>
              )
            }
          </div>
        ) : (
          <div className='h-[calc(100vh-10rem)] flex items-center justify-center flex-col'>
            <img src={no_user} />
            <button onClick={signIn} className='flex gap-2 items-center border p-2 rounded-lg'>
              <img src={google_img} className='h-4 w-4' />
              Sign in with Google
            </button>
          </div>
        )
      }
    </>
  );
};

export default DrivePage;
