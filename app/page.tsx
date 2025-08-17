"use client"

import { Autocomplete } from "@/components/autocomplete"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { BookingDetailView } from "@/components/booking-detail-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchStations } from "@/lib/api"
import { useBookingStore, bookingActions } from "@/lib/store/booking-context"

const fetchStationsForAutocomplete = async (query: string) => {
  const stations = await fetchStations(query)
  return stations.map((station) => ({
    id: station.id,
    label: station.name,
    value: station.name,
  }))
}

export default function HomePage() {
  const { state, dispatch } = useBookingStore()

  const handleBookingClick = (booking: any) => {
    console.log("[v0] handleBookingClick called with:", booking)
    dispatch(bookingActions.setSelectedBooking(booking))
    dispatch(bookingActions.setCurrentView("booking-detail"))
  }

  const handleBackToCalendar = () => {
    dispatch(bookingActions.setCurrentView("calendar"))
    dispatch(bookingActions.setSelectedBooking(null))
  }

  const handleStationSelect = (station: any) => {
    dispatch(bookingActions.setSelectedStation(station))
  }

  if (state.currentView === "booking-detail" && state.selectedBooking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Campervan Rental Dashboard</h1>
            <p className="text-muted-foreground">Booking Details</p>
          </div>
          <BookingDetailView bookingId={state.selectedBooking.id} onBack={handleBackToCalendar} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Campervan Rental Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings and vehicle handovers efficiently</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Station Selection</CardTitle>
              <CardDescription>Select a station to filter bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Autocomplete
                placeholder="Search for a station..."
                onSelect={handleStationSelect}
                fetchOptions={fetchStationsForAutocomplete}
                selectedValue={state.selectedStation}
              />
              {state.selectedStation && (
                <div className="mt-4 p-3 bg-card rounded-lg border">
                  <h3 className="font-semibold text-card-foreground text-sm">Selected Station:</h3>
                  <p className="text-muted-foreground text-sm">{state.selectedStation.label}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Calendar</CardTitle>
                <CardDescription>
                  {state.selectedStation
                    ? `Bookings for ${state.selectedStation.label}`
                    : "Select a station to view filtered bookings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarWeekView selectedStationId={state.selectedStation?.id} onBookingClick={handleBookingClick} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">8</div>
                <div className="text-xs text-muted-foreground">Pickups</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">4</div>
                <div className="text-xs text-muted-foreground">Returns</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">2</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
