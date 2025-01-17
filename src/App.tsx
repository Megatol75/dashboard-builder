import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { LandingPage } from './components/landing-page'
import { GridDashboard } from './components/grid-dashboard'
import { FlowDashboard } from './components/flow-dashboard'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="shadui-builder-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/grid" element={<GridDashboard />} />
          <Route path="/flow" element={<FlowDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
