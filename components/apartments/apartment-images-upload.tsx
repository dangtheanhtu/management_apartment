"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ApartmentImagesUploadProps {
  defaultImages?: string[]
  onImagesChange: (imageUrls: string[]) => void
  maxImages?: number
}

export function ApartmentImagesUpload({ 
  defaultImages = [], 
  onImagesChange,
  maxImages = 10 
}: ApartmentImagesUploadProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(defaultImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check total images limit
    if (imageUrls.length + files.length > maxImages) {
      toast.error(`Chỉ được tải tối đa ${maxImages} ảnh`)
      return
    }

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png"]
        if (!validTypes.includes(file.type)) {
          toast.error(`File ${file.name} không đúng định dạng. Chỉ chấp nhận JPG, PNG`)
          continue
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn. Kích thước tối đa 5MB`)
          continue
        }

        // Upload file
        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok && data.image_url) {
          uploadedUrls.push(data.image_url)
        } else {
          console.error("Upload failed:", data)
          toast.error(`Tải ${file.name} thất bại`)
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...imageUrls, ...uploadedUrls]
        setImageUrls(newImages)
        onImagesChange(newImages)
        toast.success(`Tải lên ${uploadedUrls.length} ảnh thành công`)
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

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newImages)
    onImagesChange(newImages)
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
        multiple
      />

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {imageUrls.map((url, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square w-full bg-muted">
                <img
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}/{imageUrls.length}
              </div>
            </Card>
          ))}
        </div>
      )}

      {imageUrls.length === 0 && (
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
                  <p className="text-sm font-medium">Nhấn để tải nhiều ảnh lên</p>
                  <p className="text-xs">JPG, PNG (tối đa 5MB mỗi ảnh, tối đa {maxImages} ảnh)</p>
                </div>
              </>
            )}
          </button>
        </Card>
      )}

      {imageUrls.length > 0 && imageUrls.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Đang tải..." : `Thêm ảnh (${imageUrls.length}/${maxImages})`}
        </Button>
      )}
    </div>
  )
}
