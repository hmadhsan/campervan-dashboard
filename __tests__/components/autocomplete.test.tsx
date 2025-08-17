import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Autocomplete } from "@/components/autocomplete"
import jest from "jest" // Import jest to fix the undeclared variable error

const mockFetchOptions = jest.fn()
const mockOnSelect = jest.fn()

const defaultProps = {
  placeholder: "Search stations...",
  onSelect: mockOnSelect,
  fetchOptions: mockFetchOptions,
  selectedValue: null,
}

describe("Autocomplete", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders with placeholder", () => {
    render(<Autocomplete {...defaultProps} />)
    expect(screen.getByPlaceholderText("Search stations...")).toBeInTheDocument()
  })

  test("shows loading state when fetching options", async () => {
    mockFetchOptions.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<Autocomplete {...defaultProps} />)
    const input = screen.getByPlaceholderText("Search stations...")

    await userEvent.type(input, "test")

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  test("displays fetched options", async () => {
    const mockOptions = [
      { id: "1", label: "Station 1", value: "station-1" },
      { id: "2", label: "Station 2", value: "station-2" },
    ]
    mockFetchOptions.mockResolvedValue(mockOptions)

    render(<Autocomplete {...defaultProps} />)
    const input = screen.getByPlaceholderText("Search stations...")

    await userEvent.type(input, "station")

    await waitFor(() => {
      expect(screen.getByText("Station 1")).toBeInTheDocument()
      expect(screen.getByText("Station 2")).toBeInTheDocument()
    })
  })

  test("calls onSelect when option is clicked", async () => {
    const mockOptions = [{ id: "1", label: "Station 1", value: "station-1" }]
    mockFetchOptions.mockResolvedValue(mockOptions)

    render(<Autocomplete {...defaultProps} />)
    const input = screen.getByPlaceholderText("Search stations...")

    await userEvent.type(input, "station")

    await waitFor(() => {
      expect(screen.getByText("Station 1")).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText("Station 1"))

    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0])
  })

  test("handles keyboard navigation", async () => {
    const mockOptions = [
      { id: "1", label: "Station 1", value: "station-1" },
      { id: "2", label: "Station 2", value: "station-2" },
    ]
    mockFetchOptions.mockResolvedValue(mockOptions)

    render(<Autocomplete {...defaultProps} />)
    const input = screen.getByPlaceholderText("Search stations...")

    await userEvent.type(input, "station")

    await waitFor(() => {
      expect(screen.getByText("Station 1")).toBeInTheDocument()
    })

    // Test arrow down navigation
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0])
  })

  test("displays selected value", () => {
    const selectedValue = { id: "1", label: "Selected Station", value: "selected" }

    render(<Autocomplete {...defaultProps} selectedValue={selectedValue} />)

    expect(screen.getByDisplayValue("Selected Station")).toBeInTheDocument()
  })
})
