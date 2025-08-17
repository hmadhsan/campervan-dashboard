"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDown, Search, X } from "lucide-react"

interface AutocompleteOption {
  id: string
  label: string
  value: string
}

interface AutocompleteProps {
  placeholder?: string
  onSelect: (option: AutocompleteOption | null) => void
  fetchOptions: (query: string) => Promise<AutocompleteOption[]>
  selectedValue?: AutocompleteOption | null
  className?: string
  disabled?: boolean
}

export function Autocomplete({
  placeholder = "Search...",
  onSelect,
  fetchOptions,
  selectedValue = null,
  className,
  disabled = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setOptions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await fetchOptions(query)
        setOptions(results)
      } catch (error) {
        console.error("Failed to fetch options:", error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, fetchOptions])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            handleSelect(options[highlightedIndex])
          }
          break
        case "Escape":
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, options, highlightedIndex])

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option)
    setQuery(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    onSelect(null)
    setQuery("")
    setOptions([])
    inputRef.current?.focus()
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (!isOpen && value.trim()) {
      setIsOpen(true)
    }
  }

  // Update query when selectedValue changes externally
  useEffect(() => {
    if (selectedValue) {
      setQuery(selectedValue.label)
    } else {
      setQuery("")
    }
  }, [selectedValue])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {selectedValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full z-50 mt-1 w-full border bg-popover shadow-md">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : options.length > 0 ? (
            <ul ref={listRef} className="max-h-60 overflow-auto p-1">
              {options.map((option, index) => (
                <li key={option.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      index === highlightedIndex && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.label}
                  </Button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
