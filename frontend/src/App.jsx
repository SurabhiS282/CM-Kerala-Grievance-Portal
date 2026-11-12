import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Departments from './pages/Departments';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitGrievance from './pages/citizen/SubmitGrievance';
import GrievanceDetail from './pages/citizen/GrievanceDetail';

// CMO pages
import CMODashboard from './pages/cmo/CMODashboard';
import CMOGrievances from './pages/cmo/CMOGrievances';
import CMOGrievanceDetail from './pages/cmo/CMOGrievanceDetail';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerAssignmentDetail from './pages/officer/OfficerAssignmentDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen routes */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>
          } />
          <Route path="/citizen/submit" element={
            <ProtectedRoute roles={['citizen']}><SubmitGrievance /></ProtectedRoute>
          } />
          <Route path="/citizen/grievance/:id" element={
            <ProtectedRoute roles={['citizen']}><GrievanceDetail /></ProtectedRoute>
          } />

          {/* CMO routes */}
          <Route path="/cmo/dashboard" element={
            <ProtectedRoute roles={['cmo_admin']}><CMODashboard /></ProtectedRoute>
          } />
          <Route path="/cmo/grievances" element={
            <ProtectedRoute roles={['cmo_admin']}><CMOGrievances /></ProtectedRoute>
          } />
          <Route path="/cmo/grievance/:id" element={
            <ProtectedRoute roles={['cmo_admin']}><CMOGrievanceDetail /></ProtectedRoute>
          } />

          {/* Officer routes */}
          <Route path="/officer/dashboard" element={
            <ProtectedRoute roles={['officer']}><OfficerDashboard /></ProtectedRoute>
          } />
          <Route path="/officer/assignment/:id" element={
            <ProtectedRoute roles={['officer']}><OfficerAssignmentDetail /></ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
