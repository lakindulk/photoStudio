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

interface MultiMediaUploadProps {
  label: string
  values: string[]
  onChange: (urls: string[]) => void
  accept?: "image" | "video" | "both"
  maxSizeMB?: number
  storagePath?: string
  maxItems?: number
}

export function MultiMediaUpload({
  label,
  values,
  onChange,
  accept = "both",
  maxSizeMB = 10,
  storagePath = "portfolio",
  maxItems = 20,
}: MultiMediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const acceptTypes = {
    image: "image/*",
    video: "video/*",
    both: "image/*,video/*",
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    if (values.length >= maxItems) {
      toast({
        title: "Maximum Items Reached",
        description: `You can only add up to ${maxItems} items.`,
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
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const storageRef = ref(storage, `${storagePath}/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      onChange([...values, downloadURL])
      
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
      // Reset file input
      e.target.value = ""
    }
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    if (values.length >= maxItems) {
      toast({
        title: "Maximum Items Reached",
        description: `You can only add up to ${maxItems} items.`,
        variant: "destructive",
      })
      return
    }

    onChange([...values, urlInput.trim()])
    setUrlInput("")
    
    toast({
      title: "URL Added",
      description: "Media URL has been added successfully",
    })
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const isImage = (url: string) => url && (url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || url.includes("image"))
  const isVideo = (url: string) => url && (url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("video"))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300">{label}</Label>
        <span className="text-sm text-gray-500">
          {values.length} / {maxItems} items
        </span>
      </div>

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
              disabled={uploading || values.length >= maxItems}
              className="bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSizeMB}MB per file. {maxSizeMB < 50 && "For larger files, use the URL option."}
          </p>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/media.jpg or .mp4"
              className="bg-gray-800 border-gray-700 text-white"
              disabled={values.length >= maxItems}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleUrlAdd()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleUrlAdd}
              variant="outline"
              className="border-gray-700"
              disabled={values.length >= maxItems}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Paste a direct URL to your image or video. Press Enter or click + to add.
          </p>
        </TabsContent>
      </Tabs>

      {/* Gallery Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {values.map((url, index) => (
            <div key={index} className="relative group">
              {isImage(url) && (
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {isVideo(url) && (
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
              {!isImage(url) && !isVideo(url) && (
                <div className="flex items-center justify-center h-32 bg-gray-800 rounded-lg p-2">
                  <LinkIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <Button
                type="button"
                onClick={() => handleRemove(index)}
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
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


