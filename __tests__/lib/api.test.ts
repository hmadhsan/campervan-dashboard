import { fetchStations, fetchBookings, fetchBookingDetails } from "@/lib/api"
import jest from "jest"

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe("API functions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("fetchStations", () => {
    test("fetches stations successfully", async () => {
      const mockStations = [
        { id: "1", name: "Station 1", address: "Address 1" },
        { id: "2", name: "Station 2", address: "Address 2" },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStations,
      } as Response)

      const result = await fetchStations("station")

      expect(mockFetch).toHaveBeenCalledWith("/api/stations?query=station")
      expect(result).toEqual(mockStations)
    })

    test("handles fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const result = await fetchStations("station")

      expect(result).toEqual([])
    })
  })

  describe("fetchBookings", () => {
    test("fetches bookings successfully", async () => {
      const mockBookings = [
        {
          id: "1",
          customerName: "John Doe",
          startDate: "2025-08-18",
          endDate: "2025-08-20",
          vehicleType: "Compact Van",
          status: "confirmed",
          totalCost: 300,
          pickupStation: "Station A",
          returnStation: "Station A",
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      } as Response)

      const result = await fetchBookings("station-1", "2025-08-18", "2025-08-24")

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/bookings?stationId=station-1&startDate=2025-08-18&endDate=2025-08-24",
      )
      expect(result).toEqual(mockBookings)
    })

    test("handles missing parameters", async () => {
      const mockBookings = []

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings,
      } as Response)

      const result = await fetchBookings()

      expect(mockFetch).toHaveBeenCalledWith("/api/bookings")
      expect(result).toEqual(mockBookings)
    })
  })

  describe("fetchBookingDetails", () => {
    test("fetches booking details successfully", async () => {
      const mockBookingDetails = {
        id: "1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+1234567890",
        startDate: "2025-08-18",
        endDate: "2025-08-20",
        vehicleType: "Compact Van",
        vehicleModel: "Ford Transit",
        licensePlate: "ABC-123",
        status: "confirmed",
        totalCost: 300,
        pickupStation: "Station A",
        returnStation: "Station A",
        pickupStationAddress: "123 Main St",
        returnStationAddress: "123 Main St",
        specialRequests: "None",
        bookingDate: "2025-08-01",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingDetails,
      } as Response)

      const result = await fetchBookingDetails("1")

      expect(mockFetch).toHaveBeenCalledWith("/api/bookings/1")
      expect(result).toEqual(mockBookingDetails)
    })

    test("handles fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      const result = await fetchBookingDetails("1")

      expect(result).toBeNull()
    })
  })
})
