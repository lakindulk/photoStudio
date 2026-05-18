"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit } from "lucide-react"
import type { ServicePackage } from "@/types"

interface PackageManagerProps {
  packages: ServicePackage[]
  onChange: (packages: ServicePackage[]) => void
}

export function PackageManager({ packages, onChange }: PackageManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentPackage, setCurrentPackage] = useState<Partial<ServicePackage>>({
    name: "",
    description: "",
    price: 0,
    duration: "",
    features: [],
  })
  const [newFeature, setNewFeature] = useState("")

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setCurrentPackage((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setCurrentPackage((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSavePackage = () => {
    if (!currentPackage.name || !currentPackage.description || !currentPackage.price) {
      return
    }

    const packageData: ServicePackage = {
      id: editingIndex !== null ? packages[editingIndex].id : Date.now().toString(),
      name: currentPackage.name,
      description: currentPackage.description,
      price: currentPackage.price,
      duration: currentPackage.duration || "",
      features: currentPackage.features || [],
    }

    let newPackages: ServicePackage[]
    if (editingIndex !== null) {
      newPackages = packages.map((pkg, index) => (index === editingIndex ? packageData : pkg))
    } else {
      newPackages = [...packages, packageData]
    }

    onChange(newPackages)
    setIsEditing(false)
    setEditingIndex(null)
    setCurrentPackage({
      name: "",
      description: "",
      price: 0,
      duration: "",
      features: [],
    })
  }

  const handleEditPackage = (index: number) => {
    const pkg = packages[index]
    setCurrentPackage(pkg)
    setEditingIndex(index)
    setIsEditing(true)
  }

  const handleDeletePackage = (index: number) => {
    const newPackages = packages.filter((_, i) => i !== index)
    onChange(newPackages)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingIndex(null)
    setCurrentPackage({
      name: "",
      description: "",
      price: 0,
      duration: "",
      features: [],
    })
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Service Packages *
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Packages */}
        {packages.length > 0 && (
          <div className="space-y-3">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-medium">{pkg.name}</h4>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPackage(index)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-lg font-semibold text-white">LKR {pkg.price.toLocaleString()}</span>
                  {pkg.duration && <span className="text-gray-400 text-sm">{pkg.duration}</span>}
                </div>
                {pkg.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pkg.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Package Form */}
        {isEditing && (
          <div className="p-4 bg-gray-800 rounded-lg space-y-4">
            <h4 className="text-white font-medium">{editingIndex !== null ? "Edit Package" : "Add New Package"}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Package Name *</Label>
                <Input
                  value={currentPackage.name || ""}
                  onChange={(e) => setCurrentPackage((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Basic Package"
                />
              </div>
              <div>
                <Label className="text-gray-300">Price (LKR) *</Label>
                <Input
                  type="number"
                  value={currentPackage.price || ""}
                  onChange={(e) => setCurrentPackage((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Duration</Label>
              <Input
                value={currentPackage.duration || ""}
                onChange={(e) => setCurrentPackage((prev) => ({ ...prev, duration: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., Half Day, Full Day, 2 Hours"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description *</Label>
              <Textarea
                value={currentPackage.description || ""}
                onChange={(e) => setCurrentPackage((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
                placeholder="Describe what's included in this package"
              />
            </div>

            <div>
              <Label className="text-gray-300">Features</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <Button type="button" onClick={handleAddFeature} size="sm">
                  Add
                </Button>
              </div>
              {currentPackage.features && currentPackage.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentPackage.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {feature}
                      <button type="button" onClick={() => handleRemoveFeature(index)} className="ml-1 text-red-400">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePackage}>{editingIndex !== null ? "Update Package" : "Add Package"}</Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {packages.length === 0 && !isEditing && (
          <div className="text-center py-8 text-gray-400">
            <p>No packages added yet. Click "Add Package" to create your first service package.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
