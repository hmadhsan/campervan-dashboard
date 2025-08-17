import { type NextRequest, NextResponse } from "next/server"

const stations = [
  { id: 1, name: "Berlin Central Station", city: "Berlin", country: "Germany" },
  { id: 2, name: "Munich Airport Hub", city: "Munich", country: "Germany" },
  { id: 3, name: "Hamburg Port Terminal", city: "Hamburg", country: "Germany" },
]

const bookingDetails = {
  BK001: {
    id: "BK001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "+49 30 12345678",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
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
  },
  BK002: {
    id: "BK002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    customerPhone: "+49 89 87654321",
    startDate: "2024-01-16",
    endDate: "2024-01-20",
    pickupStationId: 1,
    returnStationId: 2,
    vehicleModel: "Mercedes Marco Polo",
    vehiclePlate: "M-MB 5678",
    vehicleColor: "Silver",
    status: "confirmed",
    pickupTime: "14:00",
    returnTime: "11:00",
    totalPrice: 1240,
    currency: "EUR",
    bookingDate: "2024-01-02",
    specialRequests: "GPS navigation system",
    insuranceType: "Standard Coverage",
  },
  BK003: {
    id: "BK003",
    customerName: "Mike Wilson",
    customerEmail: "mike.wilson@email.com",
    customerPhone: "+49 30 11223344",
    startDate: "2024-01-17",
    endDate: "2024-01-24",
    pickupStationId: 1,
    returnStationId: 1,
    vehicleModel: "Ford Transit Custom",
    vehiclePlate: "B-FD 9012",
    vehicleColor: "Blue",
    status: "pending",
    pickupTime: "09:00",
    returnTime: "18:00",
    totalPrice: 2100,
    currency: "EUR",
    bookingDate: "2024-01-03",
    specialRequests: "Bike rack needed",
    insuranceType: "Premium Coverage",
  },
  BK004: {
    id: "BK004",
    customerName: "Emma Davis",
    customerEmail: "emma.davis@email.com",
    customerPhone: "+49 89 55667788",
    startDate: "2024-01-18",
    endDate: "2024-01-21",
    pickupStationId: 2,
    returnStationId: 1,
    vehicleModel: "Peugeot Boxer",
    vehiclePlate: "M-PG 3456",
    vehicleColor: "Red",
    status: "confirmed",
    pickupTime: "12:00",
    returnTime: "15:00",
    totalPrice: 960,
    currency: "EUR",
    bookingDate: "2024-01-04",
    specialRequests: "None",
    insuranceType: "Basic Coverage",
  },
  BK005: {
    id: "BK005",
    customerName: "David Brown",
    customerEmail: "david.brown@email.com",
    customerPhone: "+49 40 99887766",
    startDate: "2024-01-19",
    endDate: "2024-01-26",
    pickupStationId: 1,
    returnStationId: 3,
    vehicleModel: "Fiat Ducato",
    vehiclePlate: "B-FT 7890",
    vehicleColor: "Gray",
    status: "confirmed",
    pickupTime: "08:00",
    returnTime: "17:00",
    totalPrice: 2240,
    currency: "EUR",
    bookingDate: "2024-01-05",
    specialRequests: "Extra bedding set",
    insuranceType: "Premium Coverage",
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const bookingId = params.id

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const booking = bookingDetails[bookingId as keyof typeof bookingDetails]

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Add station details
  const pickupStation = stations.find((s) => s.id === booking.pickupStationId)
  const returnStation = stations.find((s) => s.id === booking.returnStationId)

  const enrichedBooking = {
    ...booking,
    pickupStation,
    returnStation,
  }

  return NextResponse.json(enrichedBooking)
}
