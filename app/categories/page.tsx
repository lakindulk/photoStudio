import { Header } from "@/components/Header"
import { ServiceCategories } from "@/components/ServiceCategories"

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <Header />
      <div className="py-12 bg-[#eef3f0]/50 border-b border-border/10">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#082537] mb-4">All Categories</h1>
          <p className="text-[#303633]/70 max-w-2xl mx-auto font-medium">
            Explore our complete range of premium services, from wedding photography to corporate event planning.
          </p>
        </div>
      </div>
      
      <ServiceCategories />
    </div>
  )
}
