import { type NextRequest, NextResponse } from "next/server"

const stations = [
  { id: 1, name: "Berlin Central Station", city: "Berlin", country: "Germany" },
  { id: 2, name: "Munich Airport Hub", city: "Munich", country: "Germany" },
  { id: 3, name: "Hamburg Port Terminal", city: "Hamburg", country: "Germany" },
  { id: 4, name: "Frankfurt Main Station", city: "Frankfurt", country: "Germany" },
  { id: 5, name: "Cologne Downtown", city: "Cologne", country: "Germany" },
  { id: 6, name: "Stuttgart City Center", city: "Stuttgart", country: "Germany" },
  { id: 7, name: "Düsseldorf Airport", city: "Düsseldorf", country: "Germany" },
  { id: 8, name: "Leipzig Central", city: "Leipzig", country: "Germany" },
  { id: 9, name: "Dresden Old Town", city: "Dresden", country: "Germany" },
  { id: 10, name: "Nuremberg Station", city: "Nuremberg", country: "Germany" },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const filteredStations = stations.filter(
    (station) => station.name.toLowerCase().includes(query) || station.city.toLowerCase().includes(query),
  )

  return NextResponse.json(filteredStations.slice(0, 10))
}
