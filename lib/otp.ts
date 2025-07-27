// Simple in-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const storeOTP = (email: string, otp: string): void => {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(email, { otp, expires })
}

export const verifyOTP = (email: string, otp: string): boolean => {
  const stored = otpStore.get(email)
  if (!stored) return false

  if (Date.now() > stored.expires) {
    otpStore.delete(email)
    return false
  }

  if (stored.otp === otp) {
    otpStore.delete(email)
    return true
  }

  return false
}
