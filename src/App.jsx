import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import VotePage from './pages/Vote'
import ResultPage from './pages/Result'
import AdminPage from './pages/Admin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VotePage />} />
        <Route path="/results" element={<ResultPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App
