import { type NextRequest, NextResponse } from "next/server"

const bookings = [
  {
    id: "BK001",
    customerName: "John Smith",
    startDate: "2025-08-15",
    endDate: "2025-08-22",
    pickupStationId: 1,
    returnStationId: 1,
    vehicleModel: "VW California Ocean",
    vehiclePlate: "B-VW 1234",
    status: "confirmed",
    pickupTime: "10:00",
    returnTime: "16:00",
  },
  {
    id: "BK002",
    customerName: "Sarah Johnson",
    startDate: "2025-08-16",
    endDate: "2025-08-20",
    pickupStationId: 1,
    returnStationId: 2,
    vehicleModel: "Mercedes Marco Polo",
    vehiclePlate: "M-MB 5678",
    status: "confirmed",
    pickupTime: "14:00",
    returnTime: "11:00",
  },
  {
    id: "BK003",
    customerName: "Mike Wilson",
    startDate: "2025-08-17",
    endDate: "2025-08-24",
    pickupStationId: 1,
    returnStationId: 1,
    vehicleModel: "Ford Transit Custom",
    vehiclePlate: "B-FD 9012",
    status: "pending",
    pickupTime: "09:00",
    returnTime: "18:00",
  },
  {
    id: "BK004",
    customerName: "Emma Davis",
    startDate: "2025-08-18",
    endDate: "2025-08-21",
    pickupStationId: 2,
    returnStationId: 1,
    vehicleModel: "Peugeot Boxer",
    vehiclePlate: "M-PG 3456",
    status: "confirmed",
    pickupTime: "12:00",
    returnTime: "15:00",
  },
  {
    id: "BK005",
    customerName: "David Brown",
    startDate: "2025-08-19",
    endDate: "2025-08-26",
    pickupStationId: 1,
    returnStationId: 3,
    vehicleModel: "Fiat Ducato",
    vehiclePlate: "B-FT 7890",
    status: "confirmed",
    pickupTime: "08:00",
    returnTime: "17:00",
  },
  {
    id: "BK006",
    customerName: "Lisa Anderson",
    startDate: "2025-08-25",
    endDate: "2025-08-30",
    pickupStationId: 2,
    returnStationId: 2,
    vehicleModel: "Renault Master",
    vehiclePlate: "B-RN 2468",
    status: "confirmed",
    pickupTime: "11:00",
    returnTime: "14:00",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const stationId = searchParams.get("stationId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredBookings = bookings

  if (stationId) {
    const stationIdNum = Number.parseInt(stationId)
    filteredBookings = filteredBookings.filter(
      (booking) => booking.pickupStationId === stationIdNum || booking.returnStationId === stationIdNum,
    )
  }

  if (startDate && endDate) {
    filteredBookings = filteredBookings.filter((booking) => {
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)
      const rangeStart = new Date(startDate)
      const rangeEnd = new Date(endDate)

      return bookingStart <= rangeEnd && bookingEnd >= rangeStart
    })
  }

  return NextResponse.json(filteredBookings)
}
