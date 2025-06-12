import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import google_logo from "@/assets/google.png"

const StudentLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center justify-end p-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center text-sm text-education-600 dark:text-education-400 mb-4 hover:text-education-800 dark:hover:text-education-300 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to selection
        </Link>

        <Card className="shadow-lg border-t-4 border-t-education-600 animate-fade-in dark:bg-[#0f172a] dark:border dark:border-gray-800">
          <CardContent className="p-0">
            <div className="p-6 border-b dark:border-gray-700/60">
              <h2 className="text-xl font-semibold dark:text-white">Student Login</h2>
            </div>

            <div className="p-6">
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await signIn();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                variant="outline"
                disabled={isLoading}
              >
                <img src={google_logo} className="h-4 w-4" alt="Google Auth" />
                <span>{isLoading ? "Loading..." : "Login with Google"}</span>
              </Button>
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

export default StudentLogin;
