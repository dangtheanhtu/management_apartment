"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface AmenityImageUploadProps {
  defaultImage?: string | null
  onImageChange: (imageUrl: string | null) => void
}

export function AmenityImageUpload({ defaultImage, onImageChange }: AmenityImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(defaultImage || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync with parent state
  useEffect(() => {
    setImageUrl(defaultImage || null)
  }, [defaultImage])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG")
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 5MB")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && (data.image_url || data.url)) {
        const imageUrl = data.image_url || data.url
        console.log("Image uploaded successfully, URL:", imageUrl)
        setImageUrl(imageUrl)
        onImageChange(imageUrl)
        toast.success("Tải ảnh lên thành công")
      } else {
        console.error("Upload failed:", data)
        toast.error(data.error || "Tải ảnh lên thất bại")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Có lỗi xảy ra khi tải ảnh lên")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Đã xóa ảnh")
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {imageUrl ? (
        <Card className="relative overflow-hidden">
          <div className="aspect-video w-full bg-muted">
            <img
              src={imageUrl}
              alt="Amenity preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Card className="border-dashed">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Đang tải ảnh lên...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Nhấn để tải ảnh lên</p>
                  <p className="text-xs">JPG, PNG (tối đa 5MB)</p>
                </div>
              </>
            )}
          </button>
        </Card>
      )}

      {!imageUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Đang tải..." : "Chọn ảnh"}
        </Button>
      )}
    </div>
  )
}
