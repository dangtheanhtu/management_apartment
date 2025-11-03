"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseFormDialogOptions<T = any> {
  onSuccess?: (data?: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useFormDialog<T = any>(options: UseFormDialogOptions<T> = {}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<{ error?: string; success?: boolean; data?: T }>) => {
      setIsLoading(true)

      try {
        const result = await submitFn()

        if (result.error) {
          toast.error(result.error)
          if (options.onError) {
            options.onError(new Error(result.error))
          }
          return false
        }

        if (options.successMessage) {
          toast.success(options.successMessage)
        }

        if (options.onSuccess) {
          options.onSuccess(result.data)
        }

        setOpen(false)
        return true
      } catch (error) {
        const errorMessage =
          options.errorMessage || (error instanceof Error ? error.message : "Đã xảy ra lỗi")
        toast.error(errorMessage)

        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error(errorMessage))
        }

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  return {
    open,
    isLoading,
    handleOpen,
    handleClose,
    handleSubmit,
    setOpen,
  }
}
