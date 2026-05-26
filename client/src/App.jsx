import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TypingPage from './pages/TypingPage'
import ResultsPage from './pages/ResultsPage'
import MultiplayerPage from './pages/MultiplayerPage'
import LeaderboardPage from './pages/LeaderboardPage'
import CoursesPage from './pages/CoursesPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/typing"       element={<TypingPage />} />
          <Route path="/results"      element={<ResultsPage />} />
          <Route path="/multiplayer"  element={<MultiplayerPage />} />
          <Route path="/leaderboard"  element={<LeaderboardPage />} />
          <Route path="/courses"      element={<CoursesPage />} />
          <Route path="/settings"     element={<SettingsPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/help"         element={<HelpPage />} />
        </Routes>
      </main>
    </>
  )
}
