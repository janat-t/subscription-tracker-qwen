import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/ThemeProvider"
import AuthGate from "@/components/AuthGate"
import Dashboard from "@/pages/Dashboard"
import SubscriptionForm from "@/pages/SubscriptionForm"
import Terms from "@/pages/Terms"
import Privacy from "@/pages/Privacy"

export default function App() {
  return (
    <ThemeProvider>
      <AuthGate>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<SubscriptionForm />} />
            <Route path="/edit/:id" element={<SubscriptionForm />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </BrowserRouter>
      </AuthGate>
    </ThemeProvider>
  )
}
