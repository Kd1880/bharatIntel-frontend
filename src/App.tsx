import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Terminal from './pages/Terminal'
import Alerts from './pages/Alerts'
import Queries from './pages/Queries'
import './styles/globals.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/terminal" element={<Terminal />} />
        <Route path="/alerts"   element={<Alerts />} />
        <Route path="/queries"  element={<Queries />} />
      </Routes>
    </BrowserRouter>
  )
}