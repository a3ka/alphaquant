"use client"

import { SignUp, SignIn } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'sign-up' | 'sign-in'
  onModeChange: (mode: 'sign-up' | 'sign-in') => void
}

export const AuthModal = ({ isOpen, onClose, mode, onModeChange }: AuthModalProps) => {
  const appearance = {
    baseTheme: 'dark',
    elements: {
      rootBox: "mx-auto",
      card: "bg-[#0A1929] backdrop-blur-sm border border-[#1E293B] shadow-xl",
      headerTitle: "text-white text-xl font-semibold",
      headerSubtitle: "text-gray-300",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
      formFieldLabel: "text-gray-300",
      formFieldInput: "bg-[#132F4C] border-[#1E293B] text-white",
      footerActionLink: "text-blue-400 hover:text-blue-300 cursor-pointer",
      dividerLine: "bg-[#1E293B]",
      dividerText: "text-gray-400",
      socialButtonsBlockButton: "border-[#1E293B] hover:bg-[#132F4C] text-white",
      socialButtonsBlockButtonText: "text-white",
      formFieldAction: "text-blue-400 hover:text-blue-300",
      otherOptionsText: "text-gray-400"
    },
    layout: {
      socialButtonsPlacement: "bottom" as const,
      footerActionLink: {
        onClick: (e: any) => {
          e.preventDefault();
          const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
          onModeChange(newMode);
        }
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-transparent border-none">
        <VisuallyHidden>
          <DialogTitle>{mode === 'sign-in' ? 'Sign In' : 'Sign Up'}</DialogTitle>
        </VisuallyHidden>
        {mode === 'sign-in' ? (
          <SignIn 
            appearance={appearance}
            routing="hash"
            afterSignInUrl="/trading"
          />
        ) : (
          <SignUp 
            appearance={appearance}
            routing="hash"
            afterSignUpUrl="/trading"
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 