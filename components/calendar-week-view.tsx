"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchBookings, type Booking } from "@/lib/api"
import { useBookingStore, bookingActions } from "@/lib/store/booking-context"

interface CalendarWeekViewProps {
  selectedStationId?: string
  onBookingClick: (booking: Booking) => void
}

interface DragData {
  bookingId: string
  type: "pickup" | "return"
  originalDate: string
}

export function CalendarWeekView({ selectedStationId, onBookingClick }: CalendarWeekViewProps) {
  const { state, dispatch } = useBookingStore()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DragData | null>(null)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      days.push(date)
    }
    return days
  }, [currentWeekStart])

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true)
      try {
        const weekStart = currentWeekStart.toISOString().split("T")[0]
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(currentWeekStart.getDate() + 6)
        const weekEndStr = weekEnd.toISOString().split("T")[0]

        console.log("[v0] Loading bookings for:", { selectedStationId, weekStart, weekEndStr })
        const fetchedBookings = await fetchBookings(selectedStationId, weekStart, weekEndStr)
        console.log("[v0] Fetched bookings:", fetchedBookings)
        setBookings(fetchedBookings)
      } catch (error) {
        console.error("Failed to load bookings:", error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [selectedStationId, currentWeekStart])

  const handleDragStart = (e: React.DragEvent, bookingId: string, type: "pickup" | "return", originalDate: string) => {
    const dragData: DragData = { bookingId, type, originalDate }
    setDraggedItem(dragData)
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverDay(dateStr)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverDay(null)
  }

  const handleDrop = (e: React.DragEvent, newDate: string) => {
    e.preventDefault()
    setDragOverDay(null)

    if (!draggedItem) return

    const { bookingId, type, originalDate } = draggedItem

    if (originalDate === newDate) {
      setDraggedItem(null)
      return
    }

    const rescheduleData = type === "pickup" ? { pickupDate: newDate } : { returnDate: newDate }
    dispatch(bookingActions.rescheduleBooking(bookingId, rescheduleData.pickupDate, rescheduleData.returnDate))

    console.log("[v0] SIMULATED API CALL - Reschedule Booking:")
    console.log(`PUT /api/bookings/${bookingId}/reschedule`)
    console.log("Request Body:", {
      bookingId,
      [type === "pickup" ? "newPickupDate" : "newReturnDate"]: newDate,
      originalDate,
      rescheduledBy: "station-employee",
      timestamp: new Date().toISOString(),
    })
    console.log("Expected Response: { success: true, message: 'Booking rescheduled successfully' }")

    setBookings((prevBookings) =>
      prevBookings.map((booking) => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            [type === "pickup" ? "startDate" : "endDate"]: newDate,
          }
        }
        return booking
      }),
    )

    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverDay(null)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newWeekStart)
  }

  const getBookingsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const dayBookings = bookings.filter((booking) => {
      return booking.startDate === dateStr || booking.endDate === dateStr
    })
    console.log("[v0] Bookings for", dateStr, ":", dayBookings)
    return dayBookings
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      case "completed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart)
    endDate.setDate(currentWeekStart.getDate() + 6)

    const startMonth = currentWeekStart.toLocaleDateString("en-US", { month: "short" })
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
    const year = currentWeekStart.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${currentWeekStart.getDate()}-${endDate.getDate()}, ${year}`
    } else {
      return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getRescheduledDate = (bookingId: string, type: "pickup" | "return") => {
    const rescheduled = state.rescheduledBookings[bookingId]
    if (!rescheduled) return null
    return type === "pickup" ? rescheduled.pickupDate : rescheduled.returnDate
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-muted-foreground">Loading bookings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{formatWeekRange()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Station Info */}
      {selectedStationId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Showing bookings for selected station</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
        <Move className="h-3 w-3" />
        <span>Drag pickup/return badges to reschedule bookings to different dates</span>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4">
        {weekDays.map((date, index) => {
          const dayBookings = getBookingsForDay(date)
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
          const dayNumber = date.getDate()
          const dateStr = date.toISOString().split("T")[0]
          const isDragOver = dragOverDay === dateStr

          return (
            <Card
              key={index}
              className={cn(
                "min-h-32 transition-colors",
                isToday(date) && "ring-2 ring-primary ring-offset-2",
                isDragOver && "ring-2 ring-orange-400 ring-offset-2 bg-orange-50",
              )}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateStr)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-muted-foreground">{dayName}</span>
                    <span className={cn("text-lg", isToday(date) && "text-primary font-bold")}>{dayNumber}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {dayBookings.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2 rounded border-2 border-dashed">
                    {isDragOver ? "Drop here to reschedule" : "No bookings"}
                  </div>
                ) : (
                  dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="cursor-pointer rounded-md border p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        console.log("[v0] Booking clicked:", booking)
                        onBookingClick(booking)
                      }}
                    >
                      <div className="flex items-start justify-between mb-1 gap-1">
                        <span className="text-xs font-medium truncate flex-1 min-w-0">{booking.customerName}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[11px] px-2 py-1 shrink-0 leading-tight font-medium min-w-fit",
                            getStatusColor(booking.status),
                          )}
                        >
                          {booking.status === "confirmed"
                            ? "confirmed"
                            : booking.status === "pending"
                              ? "pending"
                              : booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">{booking.vehicleType}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {booking.startDate === dateStr && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] px-2 py-1 leading-tight font-medium border-blue-300 text-blue-700 min-w-fit cursor-move",
                              getRescheduledDate(booking.id, "pickup") &&
                                "bg-orange-100 border-orange-300 text-orange-700",
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking.id, "pickup", dateStr)}
                            onDragEnd={handleDragEnd}
                          >
                            Pickup {getRescheduledDate(booking.id, "pickup") && "📅"}
                          </Badge>
                        )}
                        {booking.endDate === dateStr && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] px-2 py-1 leading-tight font-medium border-green-300 text-green-700 min-w-fit cursor-move",
                              getRescheduledDate(booking.id, "return") &&
                                "bg-orange-100 border-orange-300 text-orange-700",
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking.id, "return", dateStr)}
                            onDragEnd={handleDragEnd}
                          >
                            Return {getRescheduledDate(booking.id, "return") && "📅"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mobile Week Navigation */}
      <div className="md:hidden flex justify-center gap-2">
        <Button variant="outline" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>
        <Button variant="outline" onClick={() => navigateWeek("next")}>
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
