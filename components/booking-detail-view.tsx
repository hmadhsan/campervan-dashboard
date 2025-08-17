"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, MapPin, User, Clock, Car, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchBookingDetails, type BookingDetails } from "@/lib/api"

interface BookingDetailViewProps {
  bookingId: string
  onBack: () => void
}

export function BookingDetailView({ bookingId, onBack }: BookingDetailViewProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const details = await fetchBookingDetails(bookingId)
        setBooking(details)
      } catch (err) {
        setError("Failed to load booking details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBookingDetails()
  }, [bookingId])

  const getStatusColor = (status: BookingDetails["status"]) => {
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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calendar
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-muted-foreground">Loading booking details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calendar
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load booking details</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const duration = calculateDuration(booking.startDate, booking.endDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calendar
        </Button>
        <Badge className={cn("text-sm", getStatusColor(booking.status))}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {/* Main Booking Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Booking Details - #{booking.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{booking.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{booking.customerPhone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Dates */}
          <div>
            <h3 className="font-semibold mb-3">Booking Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Pickup Date
                </div>
                <div>
                  <div className="font-medium">{formatDate(booking.startDate)}</div>
                  <div className="text-sm text-muted-foreground">{formatTime(booking.startDate)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Return Date
                </div>
                <div>
                  <div className="font-medium">{formatDate(booking.endDate)}</div>
                  <div className="text-sm text-muted-foreground">{formatTime(booking.endDate)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
                <div className="font-medium">
                  {duration} {duration === 1 ? "day" : "days"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div>
            <h3 className="font-semibold mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{booking.vehicleType}</div>
                  <div className="text-sm text-muted-foreground">{booking.vehicleModel}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">License Plate</div>
                <div className="font-medium">{booking.licensePlate}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="font-medium text-primary">${booking.totalCost}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Station Information */}
          <div>
            <h3 className="font-semibold mb-3">Pickup & Return Station</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium">{booking.stationName}</div>
                <div className="text-sm text-muted-foreground">{booking.stationAddress}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground">{booking.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button className="flex-1">
          <Phone className="h-4 w-4 mr-2" />
          Contact Customer
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Calendar className="h-4 w-4 mr-2" />
          Reschedule Booking
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Edit Details
        </Button>
      </div>
    </div>
  )
}
