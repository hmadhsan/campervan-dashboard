"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Booking } from "@/lib/api"

// Types
export interface Station {
  id: string
  label: string
  value: string
}

export interface BookingState {
  selectedStation: Station | null
  selectedBooking: Booking | null
  currentView: "calendar" | "booking-detail"
  currentWeek: Date
  bookings: Booking[]
  rescheduledBookings: Record<string, { pickupDate?: string; returnDate?: string }>
  loading: boolean
  error: string | null
}

export type BookingAction =
  | { type: "SET_SELECTED_STATION"; payload: Station | null }
  | { type: "SET_SELECTED_BOOKING"; payload: Booking | null }
  | { type: "SET_CURRENT_VIEW"; payload: "calendar" | "booking-detail" }
  | { type: "SET_CURRENT_WEEK"; payload: Date }
  | { type: "SET_BOOKINGS"; payload: Booking[] }
  | { type: "RESCHEDULE_BOOKING"; payload: { bookingId: string; pickupDate?: string; returnDate?: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_ERROR" }

// Initial state
const initialState: BookingState = {
  selectedStation: null,
  selectedBooking: null,
  currentView: "calendar",
  currentWeek: new Date(),
  bookings: [],
  rescheduledBookings: {},
  loading: false,
  error: null,
}

// Reducer
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_SELECTED_STATION":
      return { ...state, selectedStation: action.payload }
    case "SET_SELECTED_BOOKING":
      return { ...state, selectedBooking: action.payload }
    case "SET_CURRENT_VIEW":
      return { ...state, currentView: action.payload }
    case "SET_CURRENT_WEEK":
      return { ...state, currentWeek: action.payload }
    case "SET_BOOKINGS":
      return { ...state, bookings: action.payload }
    case "RESCHEDULE_BOOKING":
      return {
        ...state,
        rescheduledBookings: {
          ...state.rescheduledBookings,
          [action.payload.bookingId]: {
            ...state.rescheduledBookings[action.payload.bookingId],
            ...action.payload,
          },
        },
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "RESET_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

// Context
const BookingContext = createContext<{
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
} | null>(null)

// Provider
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  return <BookingContext.Provider value={{ state, dispatch }}>{children}</BookingContext.Provider>
}

// Hook
export function useBookingStore() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBookingStore must be used within a BookingProvider")
  }
  return context
}

// Action creators
export const bookingActions = {
  setSelectedStation: (station: Station | null): BookingAction => ({
    type: "SET_SELECTED_STATION",
    payload: station,
  }),
  setSelectedBooking: (booking: Booking | null): BookingAction => ({
    type: "SET_SELECTED_BOOKING",
    payload: booking,
  }),
  setCurrentView: (view: "calendar" | "booking-detail"): BookingAction => ({
    type: "SET_CURRENT_VIEW",
    payload: view,
  }),
  setCurrentWeek: (week: Date): BookingAction => ({
    type: "SET_CURRENT_WEEK",
    payload: week,
  }),
  setBookings: (bookings: Booking[]): BookingAction => ({
    type: "SET_BOOKINGS",
    payload: bookings,
  }),
  rescheduleBooking: (bookingId: string, pickupDate?: string, returnDate?: string): BookingAction => ({
    type: "RESCHEDULE_BOOKING",
    payload: { bookingId, pickupDate, returnDate },
  }),
  setLoading: (loading: boolean): BookingAction => ({
    type: "SET_LOADING",
    payload: loading,
  }),
  setError: (error: string | null): BookingAction => ({
    type: "SET_ERROR",
    payload: error,
  }),
  resetError: (): BookingAction => ({
    type: "RESET_ERROR",
  }),
}
