import type { ServiceCategory } from "@/types"
import { Camera, Video, Plane, Car, Truck } from "lucide-react"

export const SERVICE_CATEGORIES: Array<{ value: ServiceCategory; label: string }> = [
  { value: "wedding-photography", label: "Wedding Photography" },
  { value: "product-photography", label: "Product Photography" },
  { value: "drone-videography", label: "Drone Videography" },
  { value: "drone-photography", label: "Drone Photography" },
  { value: "wedding-videography", label: "Wedding Videography" },
  { value: "event-photography", label: "Event Photography" },
  { value: "event-videography", label: "Event Videography" },
  { value: "event-car-renting", label: "Event Car Renting" },
  { value: "vehicle-photography", label: "Vehicle Photography" },
  { value: "vehicle-videography", label: "Vehicle Videography" },
]

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "wedding-photography": "Wedding Photography",
  "product-photography": "Product Photography",
  "drone-videography": "Drone Videography",
  "drone-photography": "Drone Photography",
  "wedding-videography": "Wedding Videography",
  "event-photography": "Event Photography",
  "event-videography": "Event Videography",
  "event-car-renting": "Event Car Renting",
  "vehicle-photography": "Vehicle Photography",
  "vehicle-videography": "Vehicle Videography",
}

export const CATEGORY_DATA: Array<{
  category: ServiceCategory
  title: string
  description: string
  icon: any
  number: string
}> = [
  {
    category: "wedding-photography",
    title: "Wedding Photography",
    description: "Capture your special day with artistic excellence",
    icon: Camera,
    number: "01",
  },
  {
    category: "product-photography",
    title: "Product Photography",
    description: "High-quality product and commercial photography",
    icon: Camera,
    number: "02",
  },
  {
    category: "drone-videography",
    title: "Drone Videography",
    description: "Aerial videography for stunning perspectives",
    icon: Plane,
    number: "03",
  },
  {
    category: "drone-photography",
    title: "Drone Photography",
    description: "Breathtaking aerial photography services",
    icon: Plane,
    number: "04",
  },
  {
    category: "wedding-videography",
    title: "Wedding Videography",
    description: "Cinematic wedding films and highlight reels",
    icon: Video,
    number: "05",
  },
  {
    category: "event-photography",
    title: "Event Photography",
    description: "Professional event coverage and candid moments",
    icon: Camera,
    number: "06",
  },
  {
    category: "event-videography",
    title: "Event Videography",
    description: "Dynamic event videography and live coverage",
    icon: Video,
    number: "07",
  },
  {
    category: "event-car-renting",
    title: "Event Car Renting",
    description: "Luxury and vintage cars for your special events",
    icon: Car,
    number: "08",
  },
  {
    category: "vehicle-photography",
    title: "Vehicle Photography",
    description: "Professional automotive and vehicle photography",
    icon: Truck,
    number: "09",
  },
  {
    category: "vehicle-videography",
    title: "Vehicle Videography",
    description: "Cinematic vehicle and automotive videography",
    icon: Truck,
    number: "10",
  },
]

export const PAYMENT_WHATSAPP_NUMBER = "+94715816400"
export const PAYMENT_WHATSAPP_URL = `https://wa.me/94715816400`

export const SUBSCRIPTION_DURATION_MONTHS = 3

// Max ads allowed per active subscription
export const MAX_ADS_PER_SUBSCRIPTION = 8

// All service categories for full-access packages
const ALL_PHOTO_VIDEO_CATEGORIES: ServiceCategory[] = [
  "drone-photography",
  "drone-videography",
  "wedding-photography",
  "wedding-videography",
  "event-photography",
  "event-videography",
  "product-photography",
  "vehicle-photography",
  "vehicle-videography",
]

const ALL_CATEGORIES: ServiceCategory[] = [
  ...ALL_PHOTO_VIDEO_CATEGORIES,
  "event-car-renting",
]

// ─── 3-Month Standard Packages ───────────────────────────────────────────────

export const SUBSCRIPTION_PACKAGES_3M = [
  {
    type: "photography-only" as const,
    name: "Photography Only",
    description: "All Photography Services including Vehicle",
    price: 2500,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: [
      "drone-photography",
      "wedding-photography",
      "event-photography",
      "product-photography",
      "vehicle-photography",
    ] as ServiceCategory[],
    features: [
      "Drone Photography",
      "Wedding Photography",
      "Event Photography",
      "Product Photography",
      "Vehicle Photography",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
    ],
  },
  {
    type: "videography-only" as const,
    name: "Videography Only",
    description: "All Videography Services including Vehicle",
    price: 2500,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: [
      "drone-videography",
      "wedding-videography",
      "event-videography",
      "vehicle-videography",
    ] as ServiceCategory[],
    features: [
      "Drone Videography",
      "Wedding Videography",
      "Event Videography",
      "Vehicle Videography",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
    ],
  },
  {
    type: "photo-video-combo" as const,
    name: "Photo & Video Combo",
    description: "Complete Photography & Videography Package",
    price: 3500,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: ALL_PHOTO_VIDEO_CATEGORIES,
    features: [
      "All Photography Services",
      "All Videography Services",
      "Vehicle Photography & Videography",
      "Drone Services",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
      "Best Value!",
    ],
    popular: true,
  },
  {
    type: "car-renting" as const,
    name: "Car Renting",
    description: "Event Car Renting Services",
    price: 4000,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: ["event-car-renting"] as ServiceCategory[],
    features: [
      "Event Car Renting",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
    ],
  },
  {
    type: "all-services" as const,
    name: "All Services",
    description: "Complete Package — Every Category Included",
    price: 5000,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "All Photography & Videography",
      "Vehicle Photography & Videography",
      "Event Car Renting",
      "Drone Services",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
      "Complete Package!",
    ],
    premium: true,
  },
]

// ─── 6-Month Standard Packages (~30% discount) ───────────────────────────────

export const SUBSCRIPTION_PACKAGES_6M = [
  {
    type: "photography-only-6m" as const,
    name: "Photography Only",
    description: "All Photography Services — 6 Month Plan",
    price: 4000,
    duration: "6 months",
    durationMonths: 6,
    allowedCategories: [
      "drone-photography",
      "wedding-photography",
      "event-photography",
      "product-photography",
      "vehicle-photography",
    ] as ServiceCategory[],
    features: [
      "All Photography Services",
      "Vehicle Photography",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Save vs 2× 3-month plans",
      "Valid for 6 months",
    ],
  },
  {
    type: "videography-only-6m" as const,
    name: "Videography Only",
    description: "All Videography Services — 6 Month Plan",
    price: 4000,
    duration: "6 months",
    durationMonths: 6,
    allowedCategories: [
      "drone-videography",
      "wedding-videography",
      "event-videography",
      "vehicle-videography",
    ] as ServiceCategory[],
    features: [
      "All Videography Services",
      "Vehicle Videography",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Save vs 2× 3-month plans",
      "Valid for 6 months",
    ],
  },
  {
    type: "photo-video-combo-6m" as const,
    name: "Photo & Video Combo",
    description: "Complete Photography & Videography — 6 Month Plan",
    price: 6000,
    duration: "6 months",
    durationMonths: 6,
    allowedCategories: ALL_PHOTO_VIDEO_CATEGORIES,
    features: [
      "All Photography & Videography",
      "Vehicle Photography & Videography",
      "Drone Services",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Best Savings!",
      "Valid for 6 months",
    ],
    popular: true,
  },
  {
    type: "car-renting-6m" as const,
    name: "Car Renting",
    description: "Event Car Renting — 6 Month Plan",
    price: 7000,
    duration: "6 months",
    durationMonths: 6,
    allowedCategories: ["event-car-renting"] as ServiceCategory[],
    features: [
      "Event Car Renting",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 6 months",
    ],
  },
  {
    type: "all-services-6m" as const,
    name: "All Services",
    description: "Complete Package — Every Category — 6 Month Plan",
    price: 8500,
    duration: "6 months",
    durationMonths: 6,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "All Photography & Videography",
      "Vehicle Photography & Videography",
      "Event Car Renting",
      "Drone Services",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Maximum Savings!",
      "Valid for 6 months",
    ],
    premium: true,
  },
]

// ─── Special / Business Packages ─────────────────────────────────────────────

export const SUBSCRIPTION_PACKAGES_SPECIAL = [
  {
    type: "ads-only" as const,
    name: "Ads Only",
    description: "In-site advertising without a portfolio website",
    price: 1500,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "In-site advertisement listings",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "No portfolio website",
      "Valid for 3 months",
    ],
    badge: "Budget",
  },
  {
    type: "ads-readymade-portfolio" as const,
    name: "Ads + Readymade Portfolio",
    description: "Advertisements with a pre-built portfolio page",
    price: 2500,
    duration: "3 months",
    durationMonths: 3,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "In-site advertisement listings",
      "Readymade portfolio page (choose from 4 styles)",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Valid for 3 months",
    ],
    badge: "Popular",
    popular: true,
  },
  {
    type: "custom-portfolio-website" as const,
    name: "Custom Portfolio Website",
    description: "We build a fully custom portfolio website tailored to your brand",
    price: 0, // Price on request
    priceLabel: "From 15,000 LKR",
    duration: "Custom",
    durationMonths: 12,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "Fully custom-designed website",
      "Your own domain & hosting",
      "Portfolio gallery & bio pages",
      "Contact & booking forms",
      "In-site advertisement listings",
      `Up to ${MAX_ADS_PER_SUBSCRIPTION} active ads`,
      "Event Calendar (Free)",
      "Price negotiated with admin",
    ],
    badge: "Premium",
    premium: true,
  },
  {
    type: "fully-managed" as const,
    name: "Fully Managed",
    description: "We handle everything — you just receive bookings and payments",
    price: 0, // Commission-based
    priceLabel: "5% per booking",
    duration: "Ongoing",
    durationMonths: 12,
    allowedCategories: ALL_CATEGORIES,
    features: [
      "Full portfolio website management",
      "Ad creation & optimization by our team",
      "Customer engagement handled for you",
      "Monthly performance reports",
      "5% commission on every successful booking",
      "No upfront subscription cost",
      "Event Calendar (Free)",
      "Best for growing businesses",
    ],
    badge: "Enterprise",
  },
]

// Combined for backward compatibility (3-month only)
export const SUBSCRIPTION_PACKAGES = SUBSCRIPTION_PACKAGES_3M

// All packages combined — use this for package lookups
export const ALL_SUBSCRIPTION_PACKAGES = [
  ...SUBSCRIPTION_PACKAGES_3M,
  ...SUBSCRIPTION_PACKAGES_6M,
  ...SUBSCRIPTION_PACKAGES_SPECIAL,
]

// Legacy
export const AD_PRICE = 5000
export const AD_DURATION_MONTHS = 3
