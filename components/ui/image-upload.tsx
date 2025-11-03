"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string | string[]
  onChange: (url: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  label?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  label = "Tải ảnh lên",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentImages = Array.isArray(value) ? value : value ? [value] : []

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (multiple && currentImages.length + files.length > maxFiles) {
      toast.error(`Chỉ được tải tối đa ${maxFiles} ảnh`)
      return
    }

    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Chỉ chấp nhận file ảnh")
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (tối đa 5MB)`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Không thể tải ảnh lên")
        }

        uploadedUrls.push(data.imageUrl)
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          onChange([...currentImages, ...uploadedUrls])
        } else {
          onChange(uploadedUrls[0])
        }
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh lên")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function handleRemoveImage(index: number) {
    if (multiple) {
      const newImages = currentImages.filter((_, i) => i !== index)
      onChange(newImages)
    } else {
      onChange("")
    }
  }

  return (
    <div className={className}>
      <Label className="block mb-2">{label}</Label>

      <div className="space-y-4">
        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || (!multiple && currentImages.length > 0)}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {multiple ? "Tải nhiều ảnh" : "Tải ảnh lên"}
              </>
            )}
          </Button>
          {multiple && (
            <p className="text-sm text-muted-foreground mt-1">
              Đã chọn {currentImages.length}/{maxFiles} ảnh
            </p>
          )}
        </div>

        {/* Image preview */}
        {currentImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentImages.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
