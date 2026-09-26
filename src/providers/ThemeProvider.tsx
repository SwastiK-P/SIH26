import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = "light" | "dark"

const KEY = "cna-theme"

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
})

function initial(): Theme {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // Private browsing, or storage disabled. Fall through to the default.
  }
  return "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
