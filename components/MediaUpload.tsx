"use client"

import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Video } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface MediaUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  accept?: "image" | "video" | "both"
  maxSizeMB?: number
  storagePath?: string
  showPreview?: boolean
  required?: boolean
}

export function MediaUpload({
  label,
  value,
  onChange,
  accept = "both",
  maxSizeMB = 10,
  storagePath = "uploads",
  showPreview = true,
  required = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value)

  const acceptTypes = {
    image: "image/*",
    video: "video/*",
    both: "image/*,video/*",
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSizeMB}MB. Please use URL option for larger files.`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const fileExtension = file.name.split(".").pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const storageRef = ref(storage, `${storagePath}/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      onChange(downloadURL)
      setUrlInput(downloadURL)
      
      toast({
        title: "Upload Successful",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      toast({
        title: "URL Added",
        description: "Media URL has been added successfully",
      })
    }
  }

  const handleClear = () => {
    onChange("")
    setUrlInput("")
  }

  const isImage = value && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i) || value.includes("image"))
  const isVideo = value && (value.match(/\.(mp4|webm|ogg|mov)$/i) || value.includes("video"))

  return (
    <div className="space-y-3">
      <Label className="text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="upload" className="data-[state=active]:bg-gray-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-gray-700">
            <LinkIcon className="w-4 h-4 mr-2" />
            Paste URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={acceptTypes[accept]}
              onChange={handleFileUpload}
              disabled={uploading}
              className="bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSizeMB}MB. {maxSizeMB < 50 && "For larger files, use the URL option."}
          </p>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/media.jpg"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              variant="outline"
              className="border-gray-700"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Paste a direct URL to your image or video hosted on any platform (Cloudinary, Imgur, etc.)
          </p>
        </TabsContent>
      </Tabs>

      {/* Preview and Clear */}
      {value && showPreview && (
        <div className="relative">
          {isImage && (
            <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          {isVideo && (
            <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden">
              <video
                src={value}
                controls
                className="w-full max-h-64"
              />
            </div>
          )}
          {!isImage && !isVideo && (
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
              {accept === "image" && <ImageIcon className="w-5 h-5 text-gray-400" />}
              {accept === "video" && <Video className="w-5 h-5 text-gray-400" />}
              {accept === "both" && <LinkIcon className="w-5 h-5 text-gray-400" />}
              <span className="text-sm text-gray-300 truncate flex-1">{value}</span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleClear}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-400 animate-pulse">
          Uploading...
        </div>
      )}
    </div>
  )
}


