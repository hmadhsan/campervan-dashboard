// API utility functions for the campervan rental dashboard

export interface Station {
  id: number
  name: string
  city: string
  country: string
}

export interface Booking {
  id: string
  customerName: string
  startDate: string
  endDate: string
  pickupStationId: number
  returnStationId: number
  vehicleModel: string
  vehiclePlate: string
  status: "confirmed" | "pending" | "completed"
  pickupTime: string
  returnTime: string
}

export interface BookingDetails extends Booking {
  customerEmail: string
  customerPhone: string
  vehicleColor: string
  totalPrice: number
  currency: string
  bookingDate: string
  specialRequests: string
  insuranceType: string
  pickupStation?: Station
  returnStation?: Station
}

// Fetch stations from the mock API
export async function fetchStations(query: string): Promise<Station[]> {
  try {
    const response = await fetch(`/api/stations?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch stations:", error)
    // Return fallback data if API fails
    return [
      { id: 1, name: "Berlin Central Station", city: "Berlin", country: "Germany" },
      { id: 2, name: "Munich Airport Hub", city: "Munich", country: "Germany" },
      { id: 3, name: "Hamburg Port Terminal", city: "Hamburg", country: "Germany" },
    ].filter(
      (station) =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.city.toLowerCase().includes(query.toLowerCase()),
    )
  }
}

// Fetch bookings for a specific station and date range
export async function fetchBookings(stationId?: number, startDate?: string, endDate?: string): Promise<Booking[]> {
  try {
    const params = new URLSearchParams()

    if (stationId) {
      params.append("stationId", stationId.toString())
    }
    if (startDate) {
      params.append("startDate", startDate)
    }
    if (endDate) {
      params.append("endDate", endDate)
    }

    const url = `/api/bookings${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch bookings:", error)
    // Return fallback mock data if API fails
    return [
      {
        id: "BK001",
        customerName: "John Smith",
        startDate: "2024-01-15",
        endDate: "2024-01-22",
        pickupStationId: stationId || 1,
        returnStationId: stationId || 1,
        vehicleModel: "VW California Ocean",
        vehiclePlate: "B-VW 1234",
        status: "confirmed",
        pickupTime: "10:00",
        returnTime: "16:00",
      },
      {
        id: "BK002",
        customerName: "Sarah Johnson",
        startDate: "2024-01-16",
        endDate: "2024-01-18",
        pickupStationId: stationId || 1,
        returnStationId: stationId || 2,
        vehicleModel: "Mercedes Marco Polo",
        vehiclePlate: "M-MB 5678",
        status: "pending",
        pickupTime: "14:00",
        returnTime: "11:00",
      },
    ]
  }
}

// Fetch detailed booking information
export async function fetchBookingDetails(bookingId: string): Promise<BookingDetails> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch booking details:", error)
    // Return fallback data
    return {
      id: bookingId,
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      customerPhone: "+49 30 12345678",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      pickupStationId: 1,
      returnStationId: 1,
      vehicleModel: "VW California Ocean",
      vehiclePlate: "B-VW 1234",
      vehicleColor: "White",
      status: "confirmed",
      pickupTime: "10:00",
      returnTime: "16:00",
      totalPrice: 1890,
      currency: "EUR",
      bookingDate: "2024-01-01",
      specialRequests: "Child seat required",
      insuranceType: "Premium Coverage",
    }
  }
}

export async function rescheduleBooking(
  bookingId: string,
  rescheduleType: "pickup" | "return",
  newDate: string,
  previousDate: string,
): Promise<Booking> {
  // Simulate API call - in real implementation this would make an actual HTTP request
  console.log(`[v0] API Call - Reschedule Booking ${bookingId}:`, {
    method: "PUT",
    url: `/api/bookings/${bookingId}/reschedule`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer [token]",
    },
    body: JSON.stringify({
      rescheduleType,
      newDate,
      previousDate,
      timestamp: new Date().toISOString(),
    }),
  })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Return mock updated booking
  return {
    id: bookingId,
    customerName: "Updated Customer",
    startDate: rescheduleType === "pickup" ? newDate : previousDate,
    endDate: rescheduleType === "return" ? newDate : previousDate,
    pickupStationId: 1,
    returnStationId: 1,
    vehicleModel: "Updated Vehicle",
    vehiclePlate: "XYZ-9876",
    status: "confirmed",
    pickupTime: "10:00",
    returnTime: "16:00",
  }
}
