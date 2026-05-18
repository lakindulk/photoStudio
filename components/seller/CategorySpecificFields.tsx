"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ServiceCategory } from "@/types"

interface CategorySpecificFieldsProps {
  category: ServiceCategory
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
}

export function CategorySpecificFields({ category, data, onChange }: CategorySpecificFieldsProps) {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const renderFields = () => {
    switch (category) {
      case "makeup-artists":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Makeup Types</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Bridal Makeup", "Party Makeup", "Editorial Makeup", "Special Effects"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={data.makeupTypes?.includes(type) || false}
                      onCheckedChange={(checked) => {
                        const types = data.makeupTypes || []
                        const newTypes = checked ? [...types, type] : types.filter((t: string) => t !== type)
                        handleChange("makeupTypes", newTypes)
                      }}
                    />
                    <Label htmlFor={type} className="text-gray-300 text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="experience" className="text-gray-300">
                Years of Experience
              </Label>
              <Input
                id="experience"
                type="number"
                value={data.experience || ""}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )

      case "vehicle-renting":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Vehicle Type</Label>
              <Select value={data.vehicleType || ""} onValueChange={(value) => handleChange("vehicleType", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="luxury-car" className="text-white">
                    Luxury Car
                  </SelectItem>
                  <SelectItem value="vintage-car" className="text-white">
                    Vintage Car
                  </SelectItem>
                  <SelectItem value="limousine" className="text-white">
                    Limousine
                  </SelectItem>
                  <SelectItem value="decorated-car" className="text-white">
                    Decorated Car
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-gray-300">
                  Seating Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={data.capacity || ""}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="fuelType" className="text-gray-300">
                  Fuel Type
                </Label>
                <Select value={data.fuelType || ""} onValueChange={(value) => handleChange("fuelType", value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="petrol" className="text-white">
                      Petrol
                    </SelectItem>
                    <SelectItem value="diesel" className="text-white">
                      Diesel
                    </SelectItem>
                    <SelectItem value="hybrid" className="text-white">
                      Hybrid
                    </SelectItem>
                    <SelectItem value="electric" className="text-white">
                      Electric
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "wedding-photographers":
      case "event-photographers":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Photography Styles</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Traditional", "Candid", "Documentary", "Fine Art", "Photojournalistic"].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox
                      id={style}
                      checked={data.styles?.includes(style) || false}
                      onCheckedChange={(checked) => {
                        const styles = data.styles || []
                        const newStyles = checked ? [...styles, style] : styles.filter((s: string) => s !== style)
                        handleChange("styles", newStyles)
                      }}
                    />
                    <Label htmlFor={style} className="text-gray-300 text-sm">
                      {style}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment" className="text-gray-300">
                  Camera Equipment
                </Label>
                <Input
                  id="equipment"
                  value={data.equipment || ""}
                  onChange={(e) => handleChange("equipment", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., Canon 5D Mark IV, Sony A7R"
                />
              </div>
              <div>
                <Label htmlFor="deliveryTime" className="text-gray-300">
                  Delivery Time (days)
                </Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  value={data.deliveryTime || ""}
                  onChange={(e) => handleChange("deliveryTime", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>
        )

      case "flower-decorators":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Decoration Types</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Bridal Bouquets", "Venue Decoration", "Car Decoration", "Stage Decoration"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={data.decorationTypes?.includes(type) || false}
                      onCheckedChange={(checked) => {
                        const types = data.decorationTypes || []
                        const newTypes = checked ? [...types, type] : types.filter((t: string) => t !== type)
                        handleChange("decorationTypes", newTypes)
                      }}
                    />
                    <Label htmlFor={type} className="text-gray-300 text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="flowerTypes" className="text-gray-300">
                Specialty Flowers
              </Label>
              <Input
                id="flowerTypes"
                value={data.flowerTypes || ""}
                onChange={(e) => handleChange("flowerTypes", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Roses, Orchids, Lilies"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialization" className="text-gray-300">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={data.specialization || ""}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Your area of expertise"
              />
            </div>
            <div>
              <Label htmlFor="experience" className="text-gray-300">
                Years of Experience
              </Label>
              <Input
                id="experience"
                type="number"
                value={data.experience || ""}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Category-Specific Details</CardTitle>
      </CardHeader>
      <CardContent>{renderFields()}</CardContent>
    </Card>
  )
}
