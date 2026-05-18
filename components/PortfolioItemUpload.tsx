"use client"

import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Video, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import type { PortfolioItem } from "@/types"

interface PortfolioItemUploadProps {
  label: string
  items: PortfolioItem[]
  onChange: (items: PortfolioItem[]) => void
  maxSizeMB?: number
  storagePath?: string
  maxItems?: number
}

export function PortfolioItemUpload({
  label,
  items,
  onChange,
  maxSizeMB = 10,
  storagePath = "portfolio",
  maxItems = 30,
}: PortfolioItemUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
    type: "image" as "image" | "video",
  })

  const resetForm = () => {
    setFormData({
      url: "",
      title: "",
      description: "",
      type: "image",
    })
    setEditingItem(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    if (items.length >= maxItems) {
      toast({
        title: "Maximum Items Reached",
        description: `You can only add up to ${maxItems} portfolio items.`,
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
      const type = file.type.startsWith("video/") ? "video" : "image"
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const storageRef = ref(storage, `${storagePath}/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      setFormData((prev) => ({ ...prev, url: downloadURL, type }))
      
      toast({
        title: "Upload Successful",
        description: "File uploaded. Please add title and description.",
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
      e.target.value = ""
    }
  }

  const handleAddItem = () => {
    if (!formData.url.trim() || !formData.title.trim()) {
      toast({
        title: "Required Fields",
        description: "Please provide URL and title",
        variant: "destructive",
      })
      return
    }

    if (editingItem) {
      // Update existing item
      const updatedItems = items.map((item) =>
        item.id === editingItem.id
          ? { ...item, url: formData.url, title: formData.title, description: formData.description }
          : item
      )
      onChange(updatedItems)
      toast({
        title: "Item Updated",
        description: "Portfolio item has been updated successfully",
      })
    } else {
      // Add new item
      const newItem: PortfolioItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
        url: formData.url.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        createdAt: new Date(),
      }
      onChange([...items, newItem])
      toast({
        title: "Item Added",
        description: "Portfolio item has been added successfully",
      })
    }

    resetForm()
    setDialogOpen(false)
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      url: item.url,
      title: item.title,
      description: item.description,
      type: item.type,
    })
    setDialogOpen(true)
  }

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
    toast({
      title: "Item Removed",
      description: "Portfolio item has been removed",
    })
  }

  const images = items.filter((item) => item.type === "image")
  const videos = items.filter((item) => item.type === "video")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300 text-lg">{label}</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {items.length} / {maxItems} items
          </span>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-700"
                disabled={items.length >= maxItems}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
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
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                    />
                    <p className="text-xs text-gray-400">
                      Maximum file size: {maxSizeMB}MB. Supports images and videos.
                    </p>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Media URL</Label>
                      <Input
                        value={formData.url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com/media.jpg or .mp4"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Type</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="image"
                            checked={formData.type === "image"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, type: "image" }))}
                            className="text-white"
                          />
                          <span className="text-gray-300">Image</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="video"
                            checked={formData.type === "video"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, type: "video" }))}
                            className="text-white"
                          />
                          <span className="text-gray-300">Video</span>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {formData.url && (
                  <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
                    <Label className="text-gray-400 text-xs mb-2 block">Preview</Label>
                    {formData.type === "image" ? (
                      <div className="relative w-full h-48 bg-gray-800 rounded overflow-hidden">
                        <Image src={formData.url} alt="Preview" fill className="object-cover" />
                      </div>
                    ) : (
                      <video src={formData.url} controls className="w-full max-h-48 rounded" />
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Wedding at Galle Fort"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this work..."
                    className="bg-gray-800 border-gray-700 text-white min-h-20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                    variant="outline"
                    className="flex-1 border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 bg-white text-black hover:bg-gray-200"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : editingItem ? "Update Item" : "Add Item"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Display Items */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Images Section */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <Label className="text-gray-300">Images ({images.length})</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((item) => (
                  <div key={item.id} className="group relative border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 hover:border-gray-600 transition-colors">
                    <div className="relative w-full h-48 bg-gray-800">
                      <Image src={item.url} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-medium text-white truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEdit(item)}
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-400" />
                <Label className="text-gray-300">Videos ({videos.length})</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((item) => (
                  <div key={item.id} className="group relative border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 hover:border-gray-600 transition-colors">
                    <div className="relative w-full h-48 bg-gray-800">
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-medium text-white truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEdit(item)}
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-500">No portfolio items yet. Click "Add Item" to get started.</p>
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-400 animate-pulse flex items-center gap-2">
          <Upload className="w-4 h-4 animate-bounce" />
          Uploading...
        </div>
      )}
    </div>
  )
}


