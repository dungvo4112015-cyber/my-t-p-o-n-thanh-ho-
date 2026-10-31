import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AppLayout } from './components/common/AppLayout';
import { RoleGuard } from './components/common/RoleGuard';

// Public & Error
import { LoginPage } from './pages/auth/LoginPage';
import { ForbiddenPage } from './pages/error/ForbiddenPage';
import { NotFoundPage } from './pages/error/NotFoundPage';

// Teacher
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassesPage } from './pages/teacher/ClassesPage';
import { ClassDetailPage } from './pages/teacher/ClassDetailPage';
import { StudentsPage } from './pages/teacher/StudentsPage';
import { ParentsPage } from './pages/teacher/ParentsPage';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { SchedulePage } from './pages/teacher/SchedulePage';
import { AssignmentsPage } from './pages/teacher/AssignmentsPage';
import { AssignmentGradePage } from './pages/teacher/AssignmentGradePage';
import { QuizzesPage } from './pages/teacher/QuizzesPage';
import { QuestionBankPage } from './pages/teacher/QuestionBankPage';
import { ResourcesPage } from './pages/teacher/ResourcesPage';
import { AiAssistantPage } from './pages/teacher/AiAssistantPage';
import { GradebookPage } from './pages/teacher/GradebookPage';
import { AttendanceAnalyticsPage } from './pages/teacher/AttendanceAnalyticsPage';
import { BehaviorPage } from './pages/teacher/BehaviorPage';
import { RewardsPage } from './pages/teacher/RewardsPage';
import { AlertsPage } from './pages/teacher/AlertsPage';
import { ToolsPage } from './pages/teacher/ToolsPage';
import { AnnouncementsPage } from './pages/teacher/AnnouncementsPage';
import { ReportsPage } from './pages/teacher/ReportsPage';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentQuizzesPage } from './pages/student/StudentQuizzesPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentAchievementsPage } from './pages/student/StudentAchievementsPage';

// Parent
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentLeaveRequestPage } from './pages/parent/ParentLeaveRequestPage';
import { ParentMessagesPage } from './pages/parent/ParentMessagesPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminBackupPage } from './pages/admin/AdminBackupPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const RootRedirect: React.FC = () => {
  const { currentRole } = useAuth();
  if (currentRole === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (currentRole === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (currentRole === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  if (currentRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <TeacherDashboard />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ClassesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/classes/create"
              element={<Navigate to="/teacher/classes?tab=create" replace />}
            />
            <Route
              path="/teacher/classes/:id"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ClassDetailPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <StudentsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/parents"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ParentsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AttendancePage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/attendance-analytics"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AttendanceAnalyticsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/schedule"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <SchedulePage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AssignmentsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/grading"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AssignmentGradePage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/assignments/:id/grading"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AssignmentGradePage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/question-bank"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <QuestionBankPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/quizzes"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <QuizzesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/resources"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ResourcesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/ai"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AiAssistantPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/grades"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <GradebookPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/behavior"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <BehaviorPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/rewards"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <RewardsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/alerts"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AlertsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/tools"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ToolsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/announcements"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <AnnouncementsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/teacher/reports"
              element={
                <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                  <AppLayout>
                    <ReportsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <StudentDashboard />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/schedule"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <SchedulePage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <StudentAssignmentsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/quizzes"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <StudentQuizzesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/resources"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <ResourcesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/grades"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <StudentGradesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/achievements"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <StudentAchievementsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                  <AppLayout>
                    <AnnouncementsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            {/* Parent Protected Routes */}
            <Route
              path="/parent/dashboard"
              element={
                <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                  <AppLayout>
                    <ParentDashboard />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/parent/children"
              element={
                <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                  <AppLayout>
                    <ParentDashboard />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/parent/leave-request"
              element={
                <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                  <AppLayout>
                    <ParentLeaveRequestPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/parent/messages"
              element={
                <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                  <AppLayout>
                    <ParentMessagesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/parent/notifications"
              element={
                <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                  <AppLayout>
                    <AnnouncementsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <ClassesPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminUsersPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminPermissionsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminAuditLogsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <ReportsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/backup"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminBackupPage />
                  </AppLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <AdminSettingsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            {/* Catch All 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
