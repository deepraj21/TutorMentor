import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Link } from "react-router-dom"
import { teacherApi } from "@/utils/api"
import { toast } from "sonner"

const TeacherLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await teacherApi.login({
        email,
        password
      })

      login({
        id: response.teacher.id,
        name: response.teacher.name,
        email: response.teacher.email,
        role: "teacher",
      })
      
      toast.success("Login successful!")
      navigate("/teacher")
    } catch (error) {
      console.error("Login failed:", error)
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center justify-end p-4">
      <div className="max-w-md w-full">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-education-600 dark:text-education-400 mb-4 hover:text-education-800 dark:hover:text-education-300 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to selection
        </Link>

        <Card className="shadow-lg border-t-4 border-t-education-600 animate-fade-in dark:bg-[#0f172a] dark:border dark:border-gray-800">
          <CardContent className="p-0">
            <div className="p-6 border-b dark:border-gray-700/60">
              <h2 className="text-xl font-semibold dark:text-white">Teacher Login</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="space-y-2 pb-6">
                <div className="flex flex-row justify-between items-center">
                  <Label htmlFor="password" className="dark:text-gray-200">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="underline">
                    <Label htmlFor="forgot" className="dark:text-gray-200 cursor-pointer">
                      forgot password?
                    </Label>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-education-600 hover:bg-education-700 dark:bg-education-700 dark:hover:bg-education-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                  <Loader2 className="animate-spin" />
                  Logging in...
                  </>
                  ) : 
                  (
                    <>
                    <LogIn />
                    Login
                    </>
                  )
                  }
              </Button>
            </form>
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
  )
}

export default TeacherLogin
