import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import Dashboard from '@/pages/Dashboard'
import SubscriptionForm from '@/pages/SubscriptionForm'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<SubscriptionForm />} />
          <Route path="/edit/:id" element={<SubscriptionForm />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
