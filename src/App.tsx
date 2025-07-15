import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Training from './pages/Training';
import IndigenousRelations from './pages/IndigenousRelations';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';
import Portal from './pages/Portal';
import CourseDetail from './pages/CourseDetail';
import PracticeQuestions from './pages/PracticeQuestions';
import PracticeExam from './pages/PracticeExam';
import SignUp from './pages/SignUp';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/training" element={<Layout><Training /></Layout>} />
          <Route path="/indigenous-relations" element={<Layout><IndigenousRelations /></Layout>} />
          <Route path="/dashboard" element={<Layout><StudentDashboard /></Layout>} />
          <Route path="/sign-up" element={<Layout><SignUp /></Layout>} />

          {/* Login page without layout */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected portal routes without main layout */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/courses/:courseId" 
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId" 
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/practice-questions/:courseId" 
            element={
              <ProtectedRoute>
                <PracticeQuestions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/practice-exam/:courseId" 
            element={
              <ProtectedRoute>
                <PracticeExam />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;