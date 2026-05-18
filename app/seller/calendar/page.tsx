"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { useAuth } from "@/contexts/AuthContext"
import {
  ChevronLeft, ChevronRight, Plus, X, CalendarDays, Clock,
  Trash2, Edit2, Camera, Users, Truck, MoreHorizontal, Lock, Sparkles,
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, onSnapshot, getDocs,
} from "firebase/firestore"
import type { CalendarEvent } from "@/types"

const EVENT_TYPES = [
  { value: "booking",  label: "Booking",          color: "#788C59", icon: Camera },
  { value: "shoot",    label: "Photo/Video Shoot", color: "#254A5A", icon: Camera },
  { value: "meeting",  label: "Client Meeting",    color: "#F59E0B", icon: Users },
  { value: "delivery", label: "Delivery / Pickup", color: "#8B5CF6", icon: Truck },
  { value: "other",    label: "Other",             color: "#6B7280", icon: MoreHorizontal },
] as const

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function getCalendarDays(year: number, month: number) {
  const firstDay       = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const days: { date: Date; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(year, month, d), current: true })
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++)
    days.push({ date: new Date(year, month + 1, d), current: false })
  return days
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function SellerCalendarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const today = new Date()

  const [currentYear, setCurrentYear]     = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth]   = useState(today.getMonth())
  const [events, setEvents]               = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate]   = useState<string | null>(null)
  const [showModal, setShowModal]         = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)
  const [editingEvent, setEditingEvent]   = useState<CalendarEvent | null>(null)
  const [saving, setSaving]               = useState(false)
  const [hasActiveSub, setHasActiveSub]   = useState<boolean | null>(null)

  const [form, setForm] = useState({
    title: "", description: "", date: "", startTime: "", endTime: "",
    type: "booking" as CalendarEvent["type"],
  })

  // Load events
  useEffect(() => {
    if (!user || !db) return
    const q = query(collection(db, "calendarEvents"), where("sellerId", "==", user.id))
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent)))
    })
    return unsub
  }, [user])

  // Check active subscription
  useEffect(() => {
    if (!user || !db) return
    const checkSub = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "subscriptions"),
            where("sellerId", "==", user.id),
            where("status", "==", "active")
          )
        )
        const now = new Date()
        const active = snap.docs.some((d) => {
          const exp = d.data().expiresAt?.toDate?.()
          return !exp || exp > now
        })
        setHasActiveSub(active)
      } catch {
        setHasActiveSub(false)
      }
    }
    checkSub()
  }, [user])

  const calDays = getCalendarDays(currentYear, currentMonth)
  const eventsOnDate   = (date: Date) => events.filter((e) => e.date === dateKey(date))
  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : []

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const tryOpenAddModal = (date?: string) => {
    if (!hasActiveSub) { setShowLockModal(true); return }
    setEditingEvent(null)
    setForm({ title: "", description: "", date: date || "", startTime: "", endTime: "", type: "booking" })
    setShowModal(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setForm({
      title: event.title, description: event.description || "",
      date: event.date, startTime: event.startTime || "",
      endTime: event.endTime || "", type: event.type,
    })
    setShowModal(true)
  }

  const saveEvent = async () => {
    if (!user || !form.title || !form.date) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      if (editingEvent) {
        await updateDoc(doc(db, "calendarEvents", editingEvent.id), { ...form, updatedAt: now })
      } else {
        await addDoc(collection(db, "calendarEvents"), { ...form, sellerId: user.id, createdAt: now, updatedAt: now })
      }
      setShowModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return
    await deleteDoc(doc(db, "calendarEvents", id))
  }

  const getTypeConfig = (type: string) => EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[4]

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/40 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#082537]">Event Calendar</h1>
            <p className="text-sm text-[#082537]/60 mt-0.5">Manage your shoots, bookings, and meetings</p>
          </div>
          <button
            onClick={() => tryOpenAddModal()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all ${
              hasActiveSub === false
                ? "bg-[#082537]/10 text-[#082537]/40 cursor-pointer"
                : "bg-[#082537] text-white hover:bg-[#082537]/90"
            }`}
          >
            {hasActiveSub === false ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Add Event
          </button>
        </div>

        {/* No-subscription banner */}
        {hasActiveSub === false && (
          <div className="mb-6 bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Calendar is locked</p>
              <p className="text-xs text-amber-700/80 mt-0.5">
                Activate a subscription to add events to your calendar.
              </p>
            </div>
            <button
              onClick={() => router.push("/seller/subscriptions/purchase")}
              className="text-xs font-bold text-amber-700 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Get a plan →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-[#082537]/8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#082537]/8">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-[#082537]/5 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-4 h-4 text-[#082537]" />
              </button>
              <h2 className="font-bold text-[#082537] text-lg">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-[#082537]/5 flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-[#082537]" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-[#082537]/8">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-[#082537]/40 py-3 uppercase tracking-wider">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calDays.map((dayObj, idx) => {
                const key       = dateKey(dayObj.date)
                const dayEvents = eventsOnDate(dayObj.date)
                const isToday   = key === dateKey(today)
                const isSelected = key === selectedDate

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(isSelected ? null : key)}
                    className={`min-h-[72px] p-1.5 border-b border-r border-[#082537]/5 cursor-pointer transition-colors ${
                      !dayObj.current ? "bg-[#082537]/2" : "bg-white hover:bg-[#eef3f0]/60"
                    } ${isSelected ? "bg-[#eef3f0] ring-2 ring-inset ring-[#788C59]" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isToday ? "bg-[#082537] text-white" : dayObj.current ? "text-[#082537]" : "text-[#082537]/25"
                    }`}>
                      {dayObj.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const cfg = getTypeConfig(ev.type)
                        return (
                          <div key={ev.id} className="text-[10px] font-medium px-1 py-0.5 rounded truncate text-white" style={{ backgroundColor: cfg.color }}>
                            {ev.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-[#082537]/40 font-medium px-1">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[#082537]/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#082537]/8 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#082537] text-sm">
                    {selectedDate
                      ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                      : "Select a day"}
                  </h3>
                  {selectedDate && (
                    <p className="text-xs text-[#082537]/40">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}</p>
                  )}
                </div>
                {selectedDate && (
                  <button
                    onClick={() => tryOpenAddModal(selectedDate)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      hasActiveSub === false
                        ? "bg-[#082537]/5 text-[#082537]/25"
                        : "bg-[#082537]/5 hover:bg-[#082537]/10"
                    }`}
                  >
                    {hasActiveSub === false
                      ? <Lock className="w-3 h-3 text-[#082537]/30" />
                      : <Plus className="w-3.5 h-3.5 text-[#082537]" />
                    }
                  </button>
                )}
              </div>
              <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                {!selectedDate && (
                  <div className="text-center py-8 text-[#082537]/30">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Click a day to see events</p>
                  </div>
                )}
                {selectedDate && selectedEvents.length === 0 && (
                  <div className="text-center py-6 text-[#082537]/30">
                    <p className="text-xs">No events on this day</p>
                    <button
                      onClick={() => tryOpenAddModal(selectedDate)}
                      className={`mt-2 text-xs font-medium ${hasActiveSub === false ? "text-[#082537]/25 cursor-pointer" : "text-[#788C59] hover:underline"}`}
                    >
                      {hasActiveSub === false ? "🔒 Locked — subscribe to add events" : "+ Add an event"}
                    </button>
                  </div>
                )}
                {selectedEvents.map((ev) => {
                  const cfg = getTypeConfig(ev.type)
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#eef3f0]/50 border border-[#082537]/5">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#082537] truncate">{ev.title}</p>
                        {(ev.startTime || ev.endTime) && (
                          <p className="text-xs text-[#082537]/50 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {ev.startTime}{ev.endTime ? ` — ${ev.endTime}` : ""}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide mt-1 px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEditModal(ev)} className="w-6 h-6 rounded hover:bg-[#082537]/10 flex items-center justify-center">
                          <Edit2 className="w-3 h-3 text-[#082537]/40" />
                        </button>
                        <button onClick={() => deleteEvent(ev.id)} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#082537]/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#082537]/8">
                <h3 className="font-bold text-[#082537] text-sm">Upcoming Events</h3>
              </div>
              <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
                {events
                  .filter((e) => e.date >= dateKey(today))
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5)
                  .map((ev) => {
                    const cfg    = getTypeConfig(ev.type)
                    const evDate = new Date(ev.date + "T00:00:00")
                    return (
                      <div key={ev.id} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: cfg.color }}>
                          <span className="text-[10px] font-bold leading-none">{String(evDate.getDate()).padStart(2, "0")}</span>
                          <span className="text-[8px] leading-none opacity-80">{MONTHS[evDate.getMonth()].slice(0, 3).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#082537] text-xs truncate">{ev.title}</p>
                          <p className="text-[#082537]/40 text-[10px]">{cfg.label}</p>
                        </div>
                      </div>
                    )
                  })}
                {events.filter((e) => e.date >= dateKey(today)).length === 0 && (
                  <p className="text-xs text-center text-[#082537]/30 py-4">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#082537]/8 p-4">
              <p className="text-xs font-bold text-[#082537]/50 uppercase tracking-wider mb-3">Event Types</p>
              <div className="space-y-2">
                {EVENT_TYPES.map((t) => (
                  <div key={t.value} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="text-xs text-[#082537]/70">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#082537]/8">
              <h2 className="font-bold text-[#082537]">{editingEvent ? "Edit Event" : "Add Event"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-[#082537]/5 flex items-center justify-center">
                <X className="w-4 h-4 text-[#082537]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding shoot at Temple Trees"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">Event Type</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, type: t.value as CalendarEvent["type"] })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.type === t.value ? "border-transparent text-white shadow" : "border-[#082537]/10 text-[#082537]/60 hover:border-[#082537]/20"
                      }`}
                      style={form.type === t.value ? { backgroundColor: t.color } : {}}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#082537]/60 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  placeholder="Any additional details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59] resize-none"
                />
              </div>
              <button
                onClick={saveEvent}
                disabled={saving || !form.title || !form.date}
                className="w-full bg-[#082537] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#082537]/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingEvent ? "Update Event" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked — no subscription modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center p-8 animate-fade-in-up">
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-full bg-[#082537]/8 flex items-center justify-center">
                <CalendarDays className="w-9 h-9 text-[#082537]/30" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
            </div>

            <h2 className="text-xl font-black text-[#082537] mb-2">Calendar Locked</h2>
            <p className="text-sm text-[#082537]/55 leading-relaxed mb-1">
              The Event Calendar is a <strong className="text-[#788C59]">free feature</strong> included with every subscription.
            </p>
            <p className="text-sm text-[#082537]/45 mb-7">
              Activate any plan to unlock it and start managing your shoots, meetings &amp; deliveries.
            </p>

            {/* Feature highlights */}
            <div className="bg-[#eef3f0]/60 rounded-2xl p-4 mb-6 text-left space-y-2">
              {[
                "Track shoots, meetings & deliveries",
                "Colour-coded event types",
                "View upcoming schedule at a glance",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-xs text-[#082537]/70">
                  <Sparkles className="w-3.5 h-3.5 text-[#788C59] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowLockModal(false); router.push("/seller/subscriptions/purchase") }}
              className="w-full bg-[#082537] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#082537]/90 transition-all hover:-translate-y-0.5 shadow-sm mb-3"
            >
              View Plans &amp; Subscribe
            </button>
            <button
              onClick={() => setShowLockModal(false)}
              className="w-full text-[#082537]/40 text-sm font-medium hover:text-[#082537]/60 transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </SellerLayout>
  )
}
