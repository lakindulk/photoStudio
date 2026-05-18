"use client"

import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Video, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface SeparateMediaUploadProps {
  label: string
  images: string[]
  videos: string[]
  onImagesChange: (urls: string[]) => void
  onVideosChange: (urls: string[]) => void
  maxSizeMB?: number
  storagePath?: string
  maxImages?: number
  maxVideos?: number
}

export function SeparateMediaUpload({
  label,
  images,
  videos,
  onImagesChange,
  onVideosChange,
  maxSizeMB = 10,
  storagePath = "media",
  maxImages = 20,
  maxVideos = 10,
}: SeparateMediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [videoUrlInput, setVideoUrlInput] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    const currentCount = type === "image" ? images.length : videos.length
    const maxCount = type === "image" ? maxImages : maxVideos

    if (currentCount >= maxCount) {
      toast({
        title: "Maximum Items Reached",
        description: `You can only add up to ${maxCount} ${type}s.`,
        variant: "destructive",
      })
      return
    }

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
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const storageRef = ref(storage, `${storagePath}/${type}s/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      if (type === "image") {
        onImagesChange([...images, downloadURL])
      } else {
        onVideosChange([...videos, downloadURL])
      }
      
      toast({
        title: "Upload Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
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
      // Reset file input
      e.target.value = ""
    }
  }

  const handleUrlAdd = (type: "image" | "video") => {
    const urlInput = type === "image" ? imageUrlInput : videoUrlInput
    if (!urlInput.trim()) return

    const currentCount = type === "image" ? images.length : videos.length
    const maxCount = type === "image" ? maxImages : maxVideos

    if (currentCount >= maxCount) {
      toast({
        title: "Maximum Items Reached",
        description: `You can only add up to ${maxCount} ${type}s.`,
        variant: "destructive",
      })
      return
    }

    if (type === "image") {
      onImagesChange([...images, urlInput.trim()])
      setImageUrlInput("")
    } else {
      onVideosChange([...videos, urlInput.trim()])
      setVideoUrlInput("")
    }
    
    toast({
      title: "URL Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} URL has been added successfully`,
    })
  }

  const handleRemove = (index: number, type: "image" | "video") => {
    if (type === "image") {
      onImagesChange(images.filter((_, i) => i !== index))
    } else {
      onVideosChange(videos.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <Label className="text-gray-300 text-lg">{label}</Label>

      {/* Images Section */}
      <div className="space-y-4 border border-gray-700 rounded-lg p-4 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Images
          </Label>
          <span className="text-sm text-gray-500">
            {images.length} / {maxImages} images
          </span>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="upload" className="data-[state=active]:bg-gray-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-gray-600">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "image")}
              disabled={uploading || images.length >= maxImages}
              className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500"
            />
            <p className="text-xs text-gray-400">
              Maximum file size: {maxSizeMB}MB per image
            </p>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-gray-700 border-gray-600 text-white"
                disabled={images.length >= maxImages}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleUrlAdd("image")
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => handleUrlAdd("image")}
                variant="outline"
                className="border-gray-600"
                disabled={images.length >= maxImages}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Paste a direct URL to your image
            </p>
          </TabsContent>
        </Tabs>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemove(index, "image")}
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="space-y-4 border border-gray-700 rounded-lg p-4 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos
          </Label>
          <span className="text-sm text-gray-500">
            {videos.length} / {maxVideos} videos
          </span>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="upload" className="data-[state=active]:bg-gray-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-gray-600">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3">
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, "video")}
              disabled={uploading || videos.length >= maxVideos}
              className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500"
            />
            <p className="text-xs text-gray-400">
              Maximum file size: {maxSizeMB}MB per video. For larger videos, use URL option.
            </p>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="bg-gray-700 border-gray-600 text-white"
                disabled={videos.length >= maxVideos}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleUrlAdd("video")
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => handleUrlAdd("video")}
                variant="outline"
                className="border-gray-600"
                disabled={videos.length >= maxVideos}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Paste a direct URL to your video or YouTube/Vimeo link
            </p>
          </TabsContent>
        </Tabs>

        {/* Videos Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {videos.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemove(index, "video")}
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div className="text-sm text-gray-400 animate-pulse flex items-center gap-2">
          <Upload className="w-4 h-4 animate-bounce" />
          Uploading...
        </div>
      )}
    </div>
  )
}


