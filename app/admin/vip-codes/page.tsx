"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Trash2, ToggleLeft, ToggleRight, Ticket, Copy, RefreshCw } from "lucide-react"
import type { VipCode, ServiceCategory } from "@/types"
import { SERVICE_CATEGORIES } from "@/lib/constants"

type DiscountType = "free" | "percent"

const DISCOUNT_OPTIONS = [20, 40, 60, 70] as const
const DURATION_OPTIONS = [1, 2, 3, 4, 5] as const

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export default function AdminVipCodesPage() {
  const [codes, setCodes] = useState<VipCode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    code: generateCode(),
    discountType: "free" as DiscountType,
    freeDurationMonths: 1,
    freeServices: "all" as "all" | ServiceCategory[],
    discountPercent: 20 as 20 | 40 | 60 | 70,
    maxUses: 0,
  })

  useEffect(() => { fetchCodes() }, [])

  const fetchCodes = async () => {
    if (!db) return
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, "vipCodes"), orderBy("createdAt", "desc")))
      setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as VipCode)))
    } catch (e) {
      toast({ title: "Error", description: "Failed to load VIP codes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!db || !form.code.trim()) return
    setSaving(true)
    try {
      const data: Omit<VipCode, "id"> = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        freeDurationMonths: form.discountType === "free" ? form.freeDurationMonths : undefined,
        freeServices: form.discountType === "free" ? form.freeServices : "all",
        discountPercent: form.discountType === "percent" ? form.discountPercent : undefined,
        maxUses: form.maxUses,
        useCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      const ref = await addDoc(collection(db, "vipCodes"), data)
      setCodes((prev) => [{ id: ref.id, ...data }, ...prev])
      toast({ title: "VIP Code Created", description: `Code ${data.code} is now active.` })
      setForm({ code: generateCode(), discountType: "free", freeDurationMonths: 1, freeServices: "all", discountPercent: 20, maxUses: 0 })
      setDialogOpen(false)
    } catch (e) {
      toast({ title: "Error", description: "Failed to create code", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    if (!db) return
    await updateDoc(doc(db, "vipCodes", id), { isActive: !current })
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !current } : c))
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete VIP code "${code}"?`)) return
    if (!db) return
    await deleteDoc(doc(db, "vipCodes", id))
    setCodes((prev) => prev.filter((c) => c.id !== id))
    toast({ title: "Deleted", description: `Code ${code} removed.` })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied", description: `${code} copied to clipboard.` })
  }

  const describeCode = (c: VipCode) => {
    if (c.discountType === "free") {
      const svc = c.freeServices === "all" ? "all services" : `${(c.freeServices as string[]).length} services`
      return `${c.freeDurationMonths} month${c.freeDurationMonths !== 1 ? "s" : ""} free — ${svc}`
    }
    return `${c.discountPercent}% off all plans`
  }

  const freeServicesList = form.freeServices === "all" ? [] : (form.freeServices as ServiceCategory[])
  const toggleService = (cat: ServiceCategory) => {
    if (form.freeServices === "all") return
    const list = form.freeServices as ServiceCategory[]
    setForm((p) => ({ ...p, freeServices: list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat] }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">VIP Codes</h1>
            <p className="text-foreground/60 text-sm mt-0.5">Create discount and free-access codes for sellers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCodes} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-[#082537] hover:bg-[#082537]/90">
                  <Plus className="w-4 h-4" /> Create Code
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/40 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create VIP Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-2">
                  {/* Code */}
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80">Code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={form.code}
                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                        className="font-mono tracking-widest bg-muted border-border/40 text-foreground"
                        placeholder="ABCD1234"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, code: generateCode() }))} className="shrink-0">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Discount Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["free", "percent"] as DiscountType[]).map((t) => (
                        <button key={t} type="button"
                          onClick={() => setForm((p) => ({ ...p, discountType: t }))}
                          className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${form.discountType === t ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                        >
                          {t === "free" ? "🎁 Free Access" : "💸 % Discount"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.discountType === "free" && (
                    <>
                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="text-foreground/80">Free Duration</Label>
                        <div className="flex gap-2 flex-wrap">
                          {DURATION_OPTIONS.map((m) => (
                            <button key={m} type="button"
                              onClick={() => setForm((p) => ({ ...p, freeDurationMonths: m }))}
                              className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.freeDurationMonths === m ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                            >
                              {m}M
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-2">
                        <Label className="text-foreground/80">Free Services</Label>
                        <div className="flex gap-2 mb-3">
                          <button type="button"
                            onClick={() => setForm((p) => ({ ...p, freeServices: "all" }))}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.freeServices === "all" ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                          >
                            All Services
                          </button>
                          <button type="button"
                            onClick={() => setForm((p) => ({ ...p, freeServices: [] }))}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.freeServices !== "all" ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                          >
                            Specific Services
                          </button>
                        </div>
                        {form.freeServices !== "all" && (
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                            {SERVICE_CATEGORIES.map((cat) => (
                              <button key={cat.value} type="button"
                                onClick={() => toggleService(cat.value)}
                                className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${freeServicesList.includes(cat.value) ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {form.discountType === "percent" && (
                    <div className="space-y-2">
                      <Label className="text-foreground/80">Discount Percentage</Label>
                      <div className="flex gap-2 flex-wrap">
                        {DISCOUNT_OPTIONS.map((d) => (
                          <button key={d} type="button"
                            onClick={() => setForm((p) => ({ ...p, discountPercent: d }))}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.discountPercent === d ? "border-[#788C59] bg-[#788C59]/10 text-[#788C59]" : "border-border/40 text-foreground/60 hover:border-border"}`}
                          >
                            {d}% off
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Max Uses */}
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80">Max Uses <span className="text-foreground/40 font-normal">(0 = unlimited)</span></Label>
                    <Input
                      type="number" min={0}
                      value={form.maxUses}
                      onChange={(e) => setForm((p) => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))}
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>

                  <Button onClick={handleCreate} disabled={saving} className="w-full bg-[#082537] hover:bg-[#082537]/90">
                    {saving ? "Creating..." : "Create VIP Code"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Codes", value: codes.length },
            { label: "Active", value: codes.filter((c) => c.isActive).length },
            { label: "Total Uses", value: codes.reduce((s, c) => s + c.useCount, 0) },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border/40 rounded-2xl p-5">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-foreground/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-foreground/50">Loading...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <Ticket className="w-8 h-8 text-foreground/20" />
              <p className="text-foreground/50 text-sm">No VIP codes yet. Create your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border/40">
                  <tr className="text-left">
                    {["Code", "Type", "Details", "Uses", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-foreground/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {codes.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground tracking-widest">{c.code}</span>
                          <button onClick={() => copyCode(c.code)} className="text-foreground/30 hover:text-foreground/70 transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={c.discountType === "free" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-blue-500/15 text-blue-600 border-blue-500/20"}>
                          {c.discountType === "free" ? "Free" : "Discount"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-foreground/70">{describeCode(c)}</td>
                      <td className="px-5 py-4 text-foreground/70">
                        {c.useCount} / {c.maxUses === 0 ? "∞" : c.maxUses}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={c.isActive ? "bg-green-500/15 text-green-600 border-green-500/20" : "bg-red-500/15 text-red-500 border-red-500/20"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(c.id, c.isActive)} title={c.isActive ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/50 hover:text-foreground">
                            {c.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => handleDelete(c.id, c.code)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-foreground/40 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
