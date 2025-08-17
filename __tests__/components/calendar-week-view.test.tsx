import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { BookingProvider } from "@/lib/store/booking-context"
import * as api from "@/lib/api"
import jest from "jest" // Declare the jest variable

// Mock the API
jest.mock("@/lib/api")
const mockFetchBookings = api.fetchBookings as jest.MockedFunction<typeof api.fetchBookings>

const mockBookings = [
  {
    id: "1",
    customerName: "John Doe",
    startDate: "2025-08-18",
    endDate: "2025-08-20",
    vehicleType: "Compact Van",
    status: "confirmed" as const,
    totalCost: 300,
    pickupStation: "Station A",
    returnStation: "Station A",
  },
]

const renderWithProvider = (component: React.ReactElement) => {
  return render(<BookingProvider>{component}</BookingProvider>)
}

describe("CalendarWeekView", () => {
  const mockOnBookingClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchBookings.mockResolvedValue(mockBookings)
  })

  test("renders calendar header with current week", () => {
    renderWithProvider(<CalendarWeekView onBookingClick={mockOnBookingClick} />)

    expect(screen.getByText(/Aug \d+-\d+, 2025/)).toBeInTheDocument()
  })

  test("renders week navigation buttons", () => {
    renderWithProvider(<CalendarWeekView onBookingClick={mockOnBookingClick} />)

    expect(screen.getAllByRole("button")).toHaveLength(4) // 2 desktop + 2 mobile nav buttons
  })

  test("displays loading state", () => {
    mockFetchBookings.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    renderWithProvider(<CalendarWeekView onBookingClick={mockOnBookingClick} />)

    expect(screen.getByText("Loading bookings...")).toBeInTheDocument()
  })

  test("displays bookings when loaded", async () => {
    renderWithProvider(<CalendarWeekView selectedStationId="station-1" onBookingClick={mockOnBookingClick} />)

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Compact Van")).toBeInTheDocument()
      expect(screen.getByText("confirmed")).toBeInTheDocument()
    })
  })

  test("calls onBookingClick when booking is clicked", async () => {
    renderWithProvider(<CalendarWeekView selectedStationId="station-1" onBookingClick={mockOnBookingClick} />)

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("John Doe").closest("div")!)

    expect(mockOnBookingClick).toHaveBeenCalledWith(mockBookings[0])
  })

  test("navigates to next week", async () => {
    renderWithProvider(<CalendarWeekView onBookingClick={mockOnBookingClick} />)

    const nextButton = screen
      .getAllByRole("button")
      .find((btn) => btn.querySelector("svg") && btn.textContent?.includes("Next"))

    if (nextButton) {
      fireEvent.click(nextButton)
    }

    // Should trigger new API call for next week
    await waitFor(() => {
      expect(mockFetchBookings).toHaveBeenCalledTimes(2)
    })
  })

  test("shows drag and drop instructions", () => {
    renderWithProvider(<CalendarWeekView onBookingClick={mockOnBookingClick} />)

    expect(screen.getByText(/Drag pickup\/return badges to reschedule/)).toBeInTheDocument()
  })

  test("displays pickup and return badges", async () => {
    renderWithProvider(<CalendarWeekView selectedStationId="station-1" onBookingClick={mockOnBookingClick} />)

    await waitFor(() => {
      expect(screen.getByText("Pickup")).toBeInTheDocument()
      expect(screen.getByText("Return")).toBeInTheDocument()
    })
  })
})
