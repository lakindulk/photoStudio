export type UserRole = "admin" | "seller"

export type ServiceCategory =
  | "wedding-photography"
  | "product-photography"
  | "drone-videography"
  | "drone-photography"
  | "wedding-videography"
  | "event-photography"
  | "event-videography"
  | "event-car-renting"
  | "vehicle-photography"
  | "vehicle-videography"

export type SubscriptionPackageType =
  | "photography-only"
  | "videography-only"
  | "photo-video-combo"
  | "car-renting"
  | "all-services"
  | "photography-only-6m"
  | "videography-only-6m"
  | "photo-video-combo-6m"
  | "car-renting-6m"
  | "all-services-6m"
  | "ads-only"
  | "ads-readymade-portfolio"
  | "custom-portfolio-website"
  | "fully-managed"

export type SubscriptionStatus = "pending" | "approved" | "rejected" | "active" | "expired"

export interface Subscription {
  id: string
  sellerId: string
  packageType: SubscriptionPackageType
  amount: number
  paymentSlipUrl: string
  status: SubscriptionStatus

  submittedAt: Date
  approvedBy?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string

  activatedAt?: Date
  expiresAt?: Date
  durationMonths?: number

  allowedCategories: ServiceCategory[]

  createdAt: Date
  updatedAt: Date
}

export interface PortfolioItem {
  id: string
  url: string
  title: string
  description: string
  type: "image" | "video"
  createdAt: Date
}

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type PortfolioType = "type1" | "type2" | "type3" | "type4"

export interface SellerProfile {
  id: string
  userId: string
  name: string
  contactNo: string
  email: string
  address: string
  hideAddress: boolean
  profileImage?: string
  coverImage?: string
  priorWorks?: string[]
  portfolioImages?: string[]
  portfolioVideos?: string[]
  portfolioItems?: PortfolioItem[]
  portfolioType?: PortfolioType
  socialMedia?: {
    facebook?: string
    instagram?: string
    youtube?: string
    website?: string
  }
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServicePackage {
  id: string
  name: string
  description: string
  price: number
  duration?: string
  features: string[]
}

export type AdStatus = "pending" | "approved" | "rejected" | "active" | "expired" | "deactivated" | "removed"

export type PaymentStatus = "pending" | "verified" | "rejected"

export interface AdPayment {
  id: string
  adId: string
  sellerId: string
  amount: number
  paymentSlipUrl: string
  status: PaymentStatus
  submittedAt: Date
  verifiedAt?: Date
  verifiedBy?: string
  notes?: string
  isReactivation?: boolean
}

export interface Advertisement {
  id: string
  sellerId: string
  category: ServiceCategory
  title: string
  description: string
  coverMedia: string
  gallery: string[]
  galleryImages?: string[]
  galleryVideos?: string[]
  packages?: ServicePackage[]
  location: string
  status: AdStatus
  paymentId?: string
  isApproved: boolean
  approvedBy?: string
  approvedAt?: Date
  rejectionReason?: string
  activatedAt?: Date
  expiresAt?: Date
  hasEditsPending: boolean
  pendingEditData?: Partial<Advertisement>
  removedBy?: string
  removedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface VipCode {
  id: string
  code: string
  discountType: "free" | "percent"
  freeDurationMonths?: number
  freeServices: "all" | ServiceCategory[]
  discountPercent?: 20 | 40 | 60 | 70
  maxUses: number
  useCount: number
  isActive: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: string
  sellerId: string
  title: string
  description?: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  type: "booking" | "shoot" | "meeting" | "delivery" | "other"
  color?: string
  createdAt: string
  updatedAt: string
}
