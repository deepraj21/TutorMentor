import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user?.role) {
      navigate(`/${user.role}`);
    }
  }, [isLoggedIn, user?.role, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center justify-end p-4">
      <div className="max-w-md w-full">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Classroom</h1>
          <p className="text-gray-600 dark:text-gray-300">Select how you want to login</p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-education-600 animate-fade-in dark:bg-[#0f172a] dark:border dark:border-gray-800">
          <CardContent className="pt-6 p-0">
            <div className="p-6 border-b dark:border-gray-700/60">
              <h2 className="text-xl font-semibold dark:text-white">Classroom Login</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
              <Link to="/login/student" className="w-full">
                <Button
                  variant="outline"
                  className="w-full py-6 flex flex-row items-center gap-3 hover:bg-education-50 hover:border-education-400 transition-colors dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                >
                  <GraduationCap className="h-6 w-6 text-education-700 dark:text-education-400" />
                  <span className="font-medium">Student</span>
                </Button>
              </Link>

              <Link to="/login/teacher" className="w-full">
                <Button
                  variant="outline"
                  className="w-full py-6 flex flex-row items-center gap-3 hover:bg-education-50 hover:border-education-400 transition-colors dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                >
                  <UserCog className="h-6 w-6 text-education-700 dark:text-education-400" />
                  <span className="font-medium">Teacher</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-left mt-8 text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            By entering your details, you agree to our{" "}
            <Link to="/terms&conditions" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy&policy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
