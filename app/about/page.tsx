import { Header } from "@/components/Header"
import { Shield, Sparkles, Leaf } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#eef3f0] py-24 border-b border-border/10">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-[#082537] mb-6">About Malka Studio</h1>
          <p className="text-[#303633]/70 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            We are dedicated to capturing the natural inner beauty of your most important moments. We connect you with top-tier professionals who understand exactly how to bring your vision to life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-24">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 grid grid-cols-4 gap-2 opacity-20">
               {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#303633]"></div>
               ))}
            </div>
            <div className="bg-[#fcfdfc] p-8 rounded-sm relative z-10 border border-border/5 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600&h=600" 
                alt="Our Studio" 
                className="w-full object-cover rounded-sm"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-sans text-[#788C59] mb-6 font-medium">OUR STORY</h2>
            <p className="text-[#303633]/70 mb-6 text-sm leading-relaxed">
              Malka Studio began with a simple idea: making it easy for people to find exceptional creative talent. Yourself required no at thoughts delicate landlord it be. Branched dashwood do is whatever it. Further be chapter at visited married in it pressed.
            </p>
            <p className="text-[#303633]/70 mb-10 text-sm leading-relaxed">
              And produce say the ten moments parties. Simple innate summer fat appear basket his desire joy. Outward clothes promise at gravity do excited. Sufficient particular impossible by reasonable oh expression is. Yet preference connection unpleasant yet melancholy but end appearance.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-[#082537] text-2xl mb-2">10+</h4>
                <p className="text-[#303633]/60 text-xs font-bold uppercase tracking-widest">Years Experience</p>
              </div>
              <div>
                <h4 className="font-bold text-[#082537] text-2xl mb-2">5000+</h4>
                <p className="text-[#303633]/60 text-xs font-bold uppercase tracking-widest">Events Captured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#fcfdfc] py-24 border-t border-border/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-sans text-[#788C59] font-medium">OUR VALUES</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border border-[#788C59] flex items-center justify-center mb-6 bg-white">
                <Leaf className="w-8 h-8 text-[#788C59] stroke-[1.5]" />
              </div>
              <h4 className="font-bold text-[#303633] text-lg mb-3">Authenticity</h4>
              <p className="text-[#303633]/60 text-xs leading-relaxed max-w-[250px]">
                We believe in capturing genuine moments and real emotions without artificial enhancement.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border border-[#788C59] flex items-center justify-center mb-6 bg-white">
                <Sparkles className="w-8 h-8 text-[#788C59] stroke-[1.5]" />
              </div>
              <h4 className="font-bold text-[#303633] text-lg mb-3">Excellence</h4>
              <p className="text-[#303633]/60 text-xs leading-relaxed max-w-[250px]">
                Only the top professionals make it to our platform, ensuring you receive perfect results every time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border border-[#788C59] flex items-center justify-center mb-6 bg-white">
                <Shield className="w-8 h-8 text-[#788C59] stroke-[1.5]" />
              </div>
              <h4 className="font-bold text-[#303633] text-lg mb-3">Trust</h4>
              <p className="text-[#303633]/60 text-xs leading-relaxed max-w-[250px]">
                Secure bookings, verified reviews, and guaranteed satisfaction on every single project.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
