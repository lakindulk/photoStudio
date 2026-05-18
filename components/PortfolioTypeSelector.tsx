"use client"

import { Check, Grid3x3, LayoutGrid, Presentation, Newspaper } from "lucide-react"
import type { PortfolioType } from "@/types"

interface PortfolioTypeSelectorProps {
  selectedType: PortfolioType
  onTypeChange: (type: PortfolioType) => void
}

const PORTFOLIO_TYPES = [
  {
    type: "type1" as PortfolioType,
    name: "Classic Grid",
    description: "Clean, uniform grid layout — equal-sized items in organized rows",
    icon: Grid3x3,
    preview: (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-[#788C59]/40 rounded" />
        ))}
      </div>
    ),
  },
  {
    type: "type2" as PortfolioType,
    name: "Masonry Style",
    description: "Pinterest-style layout with varying heights for visual interest",
    icon: LayoutGrid,
    preview: (
      <div className="grid grid-cols-3 gap-1 p-2">
        <div className="aspect-square bg-[#788C59]/40 rounded" />
        <div className="aspect-[1/1.5] bg-[#788C59]/40 rounded" />
        <div className="aspect-square bg-[#788C59]/40 rounded" />
        <div className="aspect-[1/1.5] bg-[#788C59]/40 rounded" />
        <div className="aspect-square bg-[#788C59]/40 rounded" />
        <div className="aspect-[1/1.3] bg-[#788C59]/40 rounded" />
      </div>
    ),
  },
  {
    type: "type3" as PortfolioType,
    name: "Carousel Slider",
    description: "Full-width slider with smooth transitions and navigation",
    icon: Presentation,
    preview: (
      <div className="p-2 space-y-1.5">
        <div className="aspect-video bg-[#788C59]/40 rounded" />
        <div className="flex gap-1 justify-center pt-0.5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "bg-[#082537] w-4" : "bg-[#082537]/20 w-1.5"}`}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    type: "type4" as PortfolioType,
    name: "Magazine Layout",
    description: "Editorial-style with a large featured image and supporting gallery",
    icon: Newspaper,
    preview: (
      <div className="p-2 space-y-1">
        <div className="grid grid-cols-5 gap-1">
          <div className="col-span-3 aspect-[4/3] bg-[#788C59]/40 rounded relative overflow-hidden">
            <div className="absolute top-1 left-1 bg-[#082537] rounded text-white text-[6px] px-1 py-0.5 font-bold">
              FEATURED
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <div className="flex-1 bg-[#788C59]/40 rounded" />
            <div className="flex-1 bg-[#788C59]/40 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#788C59]/30 rounded" />
          ))}
        </div>
      </div>
    ),
  },
]

export function PortfolioTypeSelector({ selectedType, onTypeChange }: PortfolioTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-white font-semibold text-base">Portfolio Display Style</p>
        <p className="text-sm text-gray-400 mt-1">
          Choose how your portfolio will be displayed to customers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PORTFOLIO_TYPES.map((pt) => {
          const Icon = pt.icon
          const isSelected = selectedType === pt.type

          return (
            <div
              key={pt.type}
              className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "border-white bg-white/10 shadow-lg shadow-white/10"
                  : "border-gray-700 bg-gray-900/60 hover:border-gray-500"
              }`}
              onClick={() => onTypeChange(pt.type)}
            >
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 bg-white text-[#082537] rounded-full p-1 shadow">
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Preview mockup */}
              <div className="bg-gray-800/60 border-b border-gray-700/50 min-h-[90px]">
                {pt.preview}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}>
                    {pt.name}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{pt.description}</p>

                <button
                  className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors mt-1 ${
                    isSelected
                      ? "bg-white text-[#082537]"
                      : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTypeChange(pt.type)
                  }}
                >
                  {isSelected ? "✓ Selected" : "Select Style"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
