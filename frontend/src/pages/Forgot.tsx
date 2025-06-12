import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail, Lock, CheckCircle, Timer } from "lucide-react"
import { Link } from "react-router-dom"
import { teacherApi } from "@/utils/api"
import { toast } from "sonner"

const CODE_EXPIRY_SECONDS = 15 * 60 // 15 minutes

const Forgot = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(CODE_EXPIRY_SECONDS)
  const [codeVerified, setCodeVerified] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  // Timer effect for code expiry
  useEffect(() => {
    if (step === 2 && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step])

  useEffect(() => {
    if (timer === 0 && step === 2) {
      toast.error("Verification code expired. Please request a new code.")
      setStep(1)
      setTimer(CODE_EXPIRY_SECONDS)
    }
  }, [timer, step])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await teacherApi.requestPasswordReset(email)
      toast.success("Verification code sent! Please check your email.")
      setStep(2)
      setTimer(CODE_EXPIRY_SECONDS)
    } catch (error) {
      console.error("Password reset request failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to request password reset")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await teacherApi.verifyResetCode(email, verificationCode)
      setCodeVerified(true)
      setStep(3)
      toast.success("Code verified! You can now set a new password.")
    } catch (error) {
      setCodeVerified(false)
      toast.error(error instanceof Error ? error.message : "Invalid or expired code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      await teacherApi.verifyAndResetPassword({
        email,
        code: verificationCode,
        newPassword
      })
      toast.success("Password reset successful!")
      navigate("/login/teacher")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestReset} className="space-y-4">
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
            <Button
              type="submit"
              className="w-full bg-education-600 hover:bg-education-700 dark:bg-education-700 dark:hover:bg-education-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>
        )
      case 2:
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="code" className="dark:text-gray-200">
                Verification Code
              </Label>
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Timer className="w-4 h-4 mr-1" />
                {formatTimer(timer)}
              </span>
            </div>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              className="dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white"
            />
            <Button
              type="submit"
              className="w-full bg-education-600 hover:bg-education-700 dark:bg-education-700 dark:hover:bg-education-600"
              disabled={isLoading || timer === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Verify Code
                </>
              )}
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Didn't get the code? <button type="button" className="underline" onClick={() => { setStep(1); setTimer(CODE_EXPIRY_SECONDS); }}>Resend</button>
            </div>
          </form>
        )
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="dark:text-gray-200">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="dark:text-gray-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="dark:bg-[#1a1f2c] dark:border-gray-700 dark:text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-education-600 hover:bg-education-700 dark:bg-education-700 dark:hover:bg-education-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center justify-end p-4">
      <div className="max-w-md w-full">
        <Link
          to="/login/teacher"
          className="inline-flex items-center text-sm text-education-600 dark:text-education-400 mb-4 hover:text-education-800 dark:hover:text-education-300 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Teacher Login
        </Link>
        <Card className="shadow-lg border-t-4 border-t-education-600 animate-fade-in dark:bg-[#0f172a] dark:border dark:border-gray-800">
          <CardContent className="p-0">
            <div className="p-6 border-b dark:border-gray-700/60">
              <h2 className="text-xl font-semibold dark:text-white">Reset Password</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step === 1 && "Enter your email to receive a verification code."}
                {step === 2 && "Enter the verification code sent to your email."}
                {step === 3 && "Enter your new password."}
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-education-600" : "bg-gray-300"}`}>
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className={`w-16 h-1 ${step >= 2 ? "bg-education-600" : "dark:bg-gray-600 bg-gray-400"}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-education-600" : "dark:bg-gray-600 bg-gray-400"}`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className={`w-16 h-1 ${step >= 3 ? "bg-education-600" : "dark:bg-gray-600 bg-gray-400"}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-education-600" : "dark:bg-gray-600 bg-gray-400"}`}>
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              {renderStep()}
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
  )
}

export default Forgot
