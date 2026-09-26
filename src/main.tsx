import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GraphProvider } from "@/providers/GraphProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <GraphProvider>
          <TooltipProvider delayDuration={200}>
            <App />
          </TooltipProvider>
        </GraphProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
