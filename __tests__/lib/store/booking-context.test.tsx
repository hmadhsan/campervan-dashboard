import { renderHook, act } from "@testing-library/react"
import { BookingProvider, useBookingStore, bookingActions } from "@/lib/store/booking-context"
import type { ReactNode } from "react"

const wrapper = ({ children }: { children: ReactNode }) => <BookingProvider>{children}</BookingProvider>

describe("BookingContext", () => {
  test("should provide initial state", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })

    expect(result.current.state).toEqual({
      selectedStation: null,
      selectedBooking: null,
      currentView: "calendar",
      currentWeek: expect.any(Date),
      bookings: [],
      rescheduledBookings: {},
      loading: false,
      error: null,
    })
  })

  test("should set selected station", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })
    const station = { id: "1", label: "Test Station", value: "test-station" }

    act(() => {
      result.current.dispatch(bookingActions.setSelectedStation(station))
    })

    expect(result.current.state.selectedStation).toEqual(station)
  })

  test("should set current view", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })

    act(() => {
      result.current.dispatch(bookingActions.setCurrentView("booking-detail"))
    })

    expect(result.current.state.currentView).toBe("booking-detail")
  })

  test("should reschedule booking", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })
    const bookingId = "booking-123"
    const newPickupDate = "2025-08-20"

    act(() => {
      result.current.dispatch(bookingActions.rescheduleBooking(bookingId, newPickupDate))
    })

    expect(result.current.state.rescheduledBookings[bookingId]).toEqual({
      pickupDate: newPickupDate,
    })
  })

  test("should handle loading state", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })

    act(() => {
      result.current.dispatch(bookingActions.setLoading(true))
    })

    expect(result.current.state.loading).toBe(true)

    act(() => {
      result.current.dispatch(bookingActions.setLoading(false))
    })

    expect(result.current.state.loading).toBe(false)
  })

  test("should handle error state", () => {
    const { result } = renderHook(() => useBookingStore(), { wrapper })
    const errorMessage = "Test error"

    act(() => {
      result.current.dispatch(bookingActions.setError(errorMessage))
    })

    expect(result.current.state.error).toBe(errorMessage)

    act(() => {
      result.current.dispatch(bookingActions.resetError())
    })

    expect(result.current.state.error).toBeNull()
  })
})
