import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientHome from './pages/patient/PatientHome';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyReports from './pages/patient/MyReports';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import AISymptomChecker from './pages/patient/AISymptomChecker';
import AIChatbot from './pages/patient/AIChatbot';
import Billing from './pages/patient/Billing';
import Telemedicine from './pages/patient/Telemedicine';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorHome from './pages/doctor/DoctorHome';
import ManageAppointments from './pages/doctor/ManageAppointments';
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorUploadReport from './pages/doctor/UploadReport';
import CalendarView from './pages/doctor/CalendarView';
import DoctorQueue from './pages/doctor/DoctorQueue';
import PatientQueue from './pages/patient/PatientQueue';

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistHome from './pages/receptionist/ReceptionistHome';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import ReceptionistBookAppointment from './pages/receptionist/ReceptionistBookAppointment';
import DoctorAvailability from './pages/receptionist/DoctorAvailability';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminReports from './pages/admin/AdminReports';
import AdminRevenue from './pages/admin/AdminRevenue';
import AuditLogs from './pages/admin/AuditLogs';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import DispenseMedicine from './pages/pharmacy/DispenseMedicine';
import IPDManagement from './pages/ipd/IPDManagement';

const Layout = ({ children, showNav = true }) => (
  <>
    {showNav && <Navbar />}
    {children}
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' },
              success: { iconTheme: { primary: '#00c9a7', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />

            <Route path="/login" element={<PublicRoute><Layout showNav={false}><LoginPage /></Layout></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Layout showNav={false}><RegisterPage /></Layout></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><Layout showNav={false}><ForgotPasswordPage /></Layout></PublicRoute>} />

            {/* Patient */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>}>
              <Route index element={<PatientHome />} />
              <Route path="dashboard" element={<PatientHome />} />
              <Route path="book-appointment" element={<BookAppointment />} />
              <Route path="my-appointments" element={<MyAppointments />} />
              <Route path="my-reports" element={<MyReports />} />
              <Route path="my-prescriptions" element={<MyPrescriptions />} />
              <Route path="ai-symptom-checker" element={<AISymptomChecker />} />
              <Route path="ai-chatbot" element={<AIChatbot />} />
              <Route path="billing" element={<Billing />} />
              <Route path="telemedicine" element={<Telemedicine />} />
              <Route path="queue" element={<PatientQueue />} />
            </Route>

            {/* Doctor */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>}>
              <Route index element={<DoctorHome />} />
              <Route path="dashboard" element={<DoctorHome />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="patients" element={<PatientHistory />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="upload-report" element={<DoctorUploadReport />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="queue" element={<DoctorQueue />} />
            </Route>

            {/* Receptionist */}
            <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>}>
              <Route index element={<ReceptionistHome />} />
              <Route path="dashboard" element={<ReceptionistHome />} />
              <Route path="register-patient" element={<RegisterPatient />} />
              <Route path="book-appointment" element={<ReceptionistBookAppointment />} />
              <Route path="doctor-availability" element={<DoctorAvailability />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}>
              <Route index element={<AdminHome />} />
              <Route path="dashboard" element={<AdminHome />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="pharmacy" element={<PharmacyDashboard />} />
              <Route path="pharmacy/dispense" element={<DispenseMedicine />} />
              <Route path="ipd" element={<IPDManagement />} />
            </Route>
            <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}><div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"><PharmacyDashboard /></div></ProtectedRoute>} />

            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="font-display text-7xl font-bold text-primary-100 dark:text-primary-900 mb-4">404</h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
                  <a href="/" className="px-6 py-2.5 bg-primary-700 text-white rounded-xl font-medium hover:bg-primary-800 transition-colors">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </SocketProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
