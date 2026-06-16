import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import SubscriptionForm from '@/pages/SubscriptionForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<SubscriptionForm />} />
        <Route path="/edit/:id" element={<SubscriptionForm />} />
      </Routes>
    </BrowserRouter>
  )
}
