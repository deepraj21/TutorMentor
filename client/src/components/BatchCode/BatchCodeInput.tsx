import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface BatchCodeInputProps {
  studentId: string
  onSuccess: () => void
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

const BatchCodeInput: React.FC<BatchCodeInputProps> = ({ studentId, onSuccess }) => {
  const [code, setCode] = useState<string>("")

  const handleSubmit = async () => {
    if (code.length !== 4) {
      toast.error("Please enter a valid batch code")
      return
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/batch/join`, {
        batchCode: code,
        studentId,
      })

      toast.success(response.data.message)
      onSuccess()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to join batch")
      } else {
        toast.error("Failed to join batch")
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h3 className="text-lg font-medium">Enter Batch Code</h3>
      <InputOTP
        maxLength={4}
        value={code}
        onChange={setCode}
        autoFocus
        pattern="^[a-zA-Z0-9]+$"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className="border-gray-500" />
          <InputOTPSlot index={1} className="border-gray-500" />
          <InputOTPSlot index={2} className="border-gray-500" />
          <InputOTPSlot index={3} className="border-gray-500" />
        </InputOTPGroup>
      </InputOTP>
      <Button onClick={handleSubmit} className="w-full mt-2">
        Join Batch
      </Button>
    </div>
  )
}

export default BatchCodeInput
