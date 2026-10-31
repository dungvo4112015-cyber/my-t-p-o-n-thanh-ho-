import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolClass,
  Student,
  AttendanceRecord,
  GradeItem,
  Assignment,
  Submission,
  Quiz,
  QuizQuestion,
  LearningResource,
  BehaviorRecord,
  RewardBadge,
  SystemAlert,
  Announcement,
  LeaveRequest,
  ParentFeedbackMessage,
  AuditLog,
  NotificationItem,
  ScheduleItem,
} from '../types';
import { StorageService } from '../services/storage';
import { FirestoreSyncService } from '../services/firebase';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // State
  classes: SchoolClass[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedClass?: SchoolClass;

  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeItem[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  questionBank: QuizQuestion[];
  resources: LearningResource[];
  behaviors: BehaviorRecord[];
  rewards: RewardBadge[];
  alerts: SystemAlert[];
  announcements: Announcement[];
  leaveRequests: LeaveRequest[];
  messages: ParentFeedbackMessage[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  schedule: ScheduleItem[];

  // Schedule Actions
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  resetSchedule: () => void;
  saveSchedule: (data: ScheduleItem[]) => void;

  // Actions
  addClass: (cls: Omit<SchoolClass, 'id' | 'createdAt' | 'studentCount'>) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;
  archiveClass: (id: string) => void;

  addStudent: (student: Omit<Student, 'id'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (students: Omit<Student, 'id'>[]) => { successCount: number; failedCount: number };

  saveAttendanceBatch: (records: AttendanceRecord[]) => void;
  saveGradesBatch: (items: GradeItem[]) => void;
  updateGradeItem: (id: string, updates: Partial<GradeItem>) => void;

  addAssignment: (asg: Omit<Assignment, 'id' | 'submissionCount' | 'gradedCount'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  gradeSubmission: (subId: string, score: number, feedback: string) => void;
  submitAssignmentStudent: (assignmentId: string, content: string, attachments?: { name: string; size: string; url: string }[]) => void;

  addQuiz: (quiz: Omit<Quiz, 'id' | 'attemptsCount'>) => Quiz;
  addQuestionBankItem: (q: Omit<QuizQuestion, 'id'>) => QuizQuestion;
  updateQuestionBankItem: (id: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestionBankItem: (id: string) => void;
  importQuestionBankItems: (items: QuizQuestion[]) => number;
  addResource: (res: Omit<LearningResource, 'id' | 'createdAt' | 'downloads'>) => LearningResource;
  deleteResource: (id: string) => void;
  toggleFavoriteResource: (id: string) => void;

  addBehaviorRecord: (rec: Omit<BehaviorRecord, 'id' | 'date'>) => void;
  addRewardBadge: (badge: Omit<RewardBadge, 'id' | 'awardedDate'>) => void;
  updateAlertStatus: (id: string, status: SystemAlert['status']) => void;

  addAnnouncement: (anc: Omit<Announcement, 'id' | 'createdAt' | 'readCount' | 'totalRecipients'>) => void;
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  respondLeaveRequest: (id: string, status: 'APPROVED' | 'REJECTED', note?: string) => void;
  sendMessage: (subject: string, message: string, teacherId: string, teacherName: string) => void;
  replyMessage: (id: string, reply: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;

  // Tools Modal States
  activeTool: 'wheel' | 'random' | 'groups' | 'timer' | 'quick-quiz' | null;
  setActiveTool: (tool: 'wheel' | 'random' | 'groups' | 'timer' | 'quick-quiz' | null) => void;

  // Delete Mode Control (Bật/Tắt chức năng xóa)
  isDeleteEnabled: boolean;
  setIsDeleteEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDeleteMode: () => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;

  // Refresh
  reloadAllData: () => void;
  resetDatabaseToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [classes, setClasses] = useState<SchoolClass[]>(() => StorageService.getClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(() => classes[0]?.id || 'cls-9a1');
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [grades, setGrades] = useState<GradeItem[]>(() => StorageService.getGrades());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [submissions, setSubmissions] = useState<Submission[]>(() => StorageService.getSubmissions());
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => StorageService.getQuizzes());
  const [questionBank, setQuestionBank] = useState<QuizQuestion[]>(() => StorageService.getQuestionBank());
  const [resources, setResources] = useState<LearningResource[]>(() => StorageService.getResources());
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(() => StorageService.getBehaviors());
  const [rewards, setRewards] = useState<RewardBadge[]>(() => StorageService.getRewards());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => StorageService.getAlerts());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => StorageService.getLeaveRequests());
  const [messages, setMessages] = useState<ParentFeedbackMessage[]>(() => StorageService.getMessages());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => StorageService.getSchedule());

  const [activeTool, setActiveTool] = useState<'wheel' | 'random' | 'groups' | 'timer' | 'quick-quiz' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Delete Mode Feature (Bật/Tắt chức năng xóa toàn hệ thống)
  const [isDeleteEnabled, setIsDeleteEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('smartschool_delete_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleDeleteMode = () => {
    setIsDeleteEnabled(prev => {
      const next = !prev;
      localStorage.setItem('smartschool_delete_enabled', String(next));
      if (next) {
        showToast('warning', '⚠️ Đã BẬT chức năng xóa dữ liệu. Hãy cẩn thận khi thao tác!');
      } else {
        showToast('info', '🛡️ Đã TẮT chức năng xóa (Chế độ an toàn chống bấm nhầm được kích hoạt).');
      }
      return next;
    });
  };

  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const reloadAllData = () => {
    setClasses(StorageService.getClasses());
    setStudents(StorageService.getStudents());
    setAttendance(StorageService.getAttendance());
    setGrades(StorageService.getGrades());
    setAssignments(StorageService.getAssignments());
    setSubmissions(StorageService.getSubmissions());
    setQuizzes(StorageService.getQuizzes());
    setQuestionBank(StorageService.getQuestionBank());
    setResources(StorageService.getResources());
    setBehaviors(StorageService.getBehaviors());
    setRewards(StorageService.getRewards());
    setAlerts(StorageService.getAlerts());
    setAnnouncements(StorageService.getAnnouncements());
    setLeaveRequests(StorageService.getLeaveRequests());
    setMessages(StorageService.getMessages());
    setAuditLogs(StorageService.getAuditLogs());
    setNotifications(StorageService.getNotifications());
    setSchedule(StorageService.getSchedule());
  };

  const resetDatabaseToDefault = () => {
    StorageService.resetAll();
    reloadAllData();
    showToast('success', 'Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công!');
  };

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // CLASSES
  const addClass = (clsData: Omit<SchoolClass, 'id' | 'createdAt' | 'studentCount'>) => {
    const newClass: SchoolClass = {
      ...clsData,
      id: `cls-${Date.now().toString(36)}`,
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };
    StorageService.addClass(newClass);
    setClasses(StorageService.getClasses());
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'classes.create',
      module: 'Quản lý lớp',
      targetName: newClass.name,
      details: `Tạo mới lớp học ${newClass.name} (Khối ${newClass.gradeLevel})`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', `Đã tạo thành công lớp ${newClass.name}`);
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    StorageService.updateClass(id, updates);
    setClasses(StorageService.getClasses());
    showToast('success', 'Cập nhật thông tin lớp học thành công!');
  };

  const deleteClass = (id: string) => {
    if (!isDeleteEnabled) {
      showToast('warning', 'Chức năng xóa đang bị TẮT! Hãy bật chế độ xóa ở thanh công cụ để thực hiện.');
      return;
    }
    const target = classes.find(c => c.id === id);
    StorageService.deleteClass(id);
    setClasses(StorageService.getClasses());
    if (selectedClassId === id) {
      setSelectedClassId(classes[0]?.id || '');
    }
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'classes.delete',
      module: 'Quản lý lớp',
      targetName: target?.name || id,
      details: `Đã xóa lớp học ${target?.name || id}`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('info', 'Đã xóa lớp học');
  };

  const archiveClass = (id: string) => {
    const target = classes.find(c => c.id === id);
    const newStatus = !target?.isArchived;
    StorageService.updateClass(id, { isArchived: newStatus });
    setClasses(StorageService.getClasses());
    showToast('success', newStatus ? 'Đã lưu trữ lớp học' : 'Đã khôi phục lớp học');
  };

  // STUDENTS
  const addStudent = (stData: Omit<Student, 'id'>) => {
    const newSt: Student = {
      ...stData,
      id: `hs-${Date.now().toString(36)}`,
    };
    StorageService.addStudent(newSt);
    setStudents(StorageService.getStudents());
    // Also create initial grade item
    const gradeItem: GradeItem = {
      id: `gr-${newSt.id}`,
      studentId: newSt.id,
      studentName: newSt.fullName,
      classId: newSt.classId,
      subject: 'Toán học',
    };
    const currentGrades = StorageService.getGrades();
    currentGrades.push(gradeItem);
    StorageService.saveGrades(currentGrades);
    setGrades(StorageService.getGrades());

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'students.create',
      module: 'Học sinh',
      targetName: newSt.fullName,
      details: `Thêm học sinh ${newSt.fullName} (${newSt.studentCode}) vào lớp ${newSt.className}`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', `Đã thêm học sinh ${newSt.fullName}`);
    return newSt;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    StorageService.updateStudent(id, updates);
    setStudents(StorageService.getStudents());
    showToast('success', 'Đã cập nhật thông tin học sinh');
  };

  const deleteStudent = (id: string) => {
    if (!isDeleteEnabled) {
      showToast('warning', 'Chức năng xóa đang bị TẮT! Hãy bật chế độ xóa ở thanh công cụ để thực hiện.');
      return;
    }
    const target = students.find(s => s.id === id);
    StorageService.deleteStudent(id);
    setStudents(StorageService.getStudents());
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'students.delete',
      module: 'Học sinh',
      targetName: target?.fullName || id,
      details: `Xóa học sinh ${target?.fullName || id} khỏi hệ thống`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('info', 'Đã xóa học sinh');
  };

  const importStudents = (importedList: Omit<Student, 'id'>[]) => {
    let successCount = 0;
    let failedCount = 0;
    const currentList = StorageService.getStudents();
    const existingCodes = new Set(currentList.map(s => s.studentCode.toUpperCase()));

    importedList.forEach(item => {
      if (!item.fullName || !item.studentCode) {
        failedCount++;
        return;
      }
      if (existingCodes.has(item.studentCode.toUpperCase())) {
        failedCount++;
        return;
      }
      const newSt: Student = {
        ...item,
        id: `hs-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      };
      currentList.unshift(newSt);
      existingCodes.add(newSt.studentCode.toUpperCase());
      successCount++;
    });

    StorageService.saveStudents(currentList);
    setStudents(StorageService.getStudents());

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'students.import',
      module: 'Học sinh',
      targetName: 'Import danh sách Excel/CSV',
      details: `Import thành công ${successCount} học sinh, thất bại ${failedCount} dòng.`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());

    return { successCount, failedCount };
  };

  // ATTENDANCE
  const saveAttendanceBatch = (records: AttendanceRecord[]) => {
    StorageService.saveAttendance(records);
    setAttendance(StorageService.getAttendance());

    // Audit log
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = records.filter(r => r.status === 'EXCUSED' || r.status === 'UNEXCUSED').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'attendance.mark',
      module: 'Điểm danh',
      targetName: `Lớp ${records[0]?.classId || ''} (${records[0]?.date || ''})`,
      details: `Lưu điểm danh ${records.length} học sinh (Có mặt: ${presentCount}, Vắng: ${absentCount}, Trễ: ${lateCount})`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', 'Đã lưu dữ liệu điểm danh thành công!');
  };

  // GRADES
  const saveGradesBatch = (items: GradeItem[]) => {
    StorageService.saveGrades(items);
    setGrades(StorageService.getGrades());
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'grades.batch_update',
      module: 'Sổ điểm',
      targetName: `Cập nhật toàn bộ bảng điểm lớp ${selectedClass?.name}`,
      details: `Đã lưu và đồng bộ điểm số cho ${items.length} học sinh`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', 'Đã lưu sổ điểm thành công!');
  };

  const updateGradeItem = (id: string, updates: Partial<GradeItem>) => {
    StorageService.updateGradeItem(id, updates);
    setGrades(StorageService.getGrades());
  };

  // ASSIGNMENTS
  const addAssignment = (asgData: Omit<Assignment, 'id' | 'submissionCount' | 'gradedCount'>) => {
    const newAsg: Assignment = {
      ...asgData,
      id: `asg-${Date.now().toString(36)}`,
      submissionCount: 0,
      gradedCount: 0,
    };
    StorageService.addAssignment(newAsg);
    setAssignments(StorageService.getAssignments());

    // Send notifications to students if published
    if (!newAsg.isDraft) {
      StorageService.addNotification({
        userId: 'u-student-1',
        title: 'Bài tập mới vừa giao',
        message: `Thầy giáo vừa giao bài tập: "${newAsg.title}" hạn nộp ${new Date(newAsg.dueDate).toLocaleDateString('vi-VN')}.`,
        type: 'assignment',
        linkUrl: '/student/assignments',
      });
      setNotifications(StorageService.getNotifications());
    }

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'assignments.create',
      module: 'Bài tập',
      targetName: newAsg.title,
      details: `Tạo bài tập mới: ${newAsg.title} (Hạn nộp: ${newAsg.dueDate})`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', `Đã giao bài tập: ${newAsg.title}`);
    return newAsg;
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    StorageService.updateAssignment(id, updates);
    setAssignments(StorageService.getAssignments());
    showToast('success', 'Đã cập nhật bài tập');
  };

  const deleteAssignment = (id: string) => {
    const target = assignments.find(a => a.id === id);
    StorageService.deleteAssignment(id);
    setAssignments(StorageService.getAssignments());
    showToast('info', `Đã xóa bài tập ${target?.title || ''}`);
  };

  const gradeSubmission = (subId: string, score: number, feedback: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return;
    const updatedSub: Submission = {
      ...sub,
      score,
      feedback,
      status: 'GRADED',
      gradedAt: new Date().toISOString(),
      gradedBy: currentUser.name,
    };
    StorageService.addOrUpdateSubmission(updatedSub);
    setSubmissions(StorageService.getSubmissions());

    // Update assignment gradedCount
    const asg = assignments.find(a => a.id === sub.assignmentId);
    if (asg) {
      const allSubsForAsg = StorageService.getSubmissions().filter(s => s.assignmentId === asg.id);
      const graded = allSubsForAsg.filter(s => s.status === 'GRADED').length;
      StorageService.updateAssignment(asg.id, { gradedCount: graded, submissionCount: allSubsForAsg.length });
      setAssignments(StorageService.getAssignments());
    }

    // Notify student
    StorageService.addNotification({
      userId: sub.studentId === 'hs-1' ? 'u-student-1' : sub.studentId,
      title: 'Bài tập đã được chấm điểm',
      message: `Bài tập của bạn đã đạt ${score} điểm. Nhận xét: "${feedback}"`,
      type: 'grade',
      linkUrl: '/student/assignments',
    });
    setNotifications(StorageService.getNotifications());

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'submissions.grade',
      module: 'Bài tập',
      targetName: `${sub.studentName} - Điểm: ${score}`,
      details: `Chấm điểm bài nộp [${sub.studentName}]: ${score} điểm. Lời phê: "${feedback}"`,
      ipAddress: '127.0.0.1',
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('success', `Đã lưu điểm cho học sinh ${sub.studentName}: ${score} điểm`);
  };

  const submitAssignmentStudent = (assignmentId: string, content: string, attachments?: { name: string; size: string; url: string }[]) => {
    const asg = assignments.find(a => a.id === assignmentId);
    const sub: Submission = {
      id: `sub-${Date.now().toString(36)}`,
      assignmentId,
      studentId: currentUser.studentId || 'hs-1',
      studentName: currentUser.name,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      content,
      attachments,
    };
    StorageService.addOrUpdateSubmission(sub);
    setSubmissions(StorageService.getSubmissions());

    // Update asg submission count
    if (asg) {
      const allSubs = StorageService.getSubmissions().filter(s => s.assignmentId === assignmentId);
      StorageService.updateAssignment(assignmentId, { submissionCount: allSubs.length });
      setAssignments(StorageService.getAssignments());
    }

    // Notify teacher
    StorageService.addNotification({
      userId: 'u-teacher-1',
      title: 'Học sinh nộp bài tập',
      message: `${currentUser.name} vừa nộp bài cho "${asg?.title || 'bài tập'}".`,
      type: 'assignment',
      linkUrl: `/teacher/assignments`,
    });
    setNotifications(StorageService.getNotifications());

    showToast('success', 'Nộp bài tập thành công! Giáo viên sẽ xem và chấm điểm sớm.');
  };

  // QUIZZES
  const addQuiz = (qData: Omit<Quiz, 'id' | 'attemptsCount'>) => {
    const newQuiz: Quiz = {
      ...qData,
      id: `quiz-${Date.now().toString(36)}`,
      attemptsCount: 0,
    };
    StorageService.addQuiz(newQuiz);
    FirestoreSyncService.saveDoc('quizzes', newQuiz.id, newQuiz).catch(() => {});
    setQuizzes(StorageService.getQuizzes());
    showToast('success', `Đã tạo bài kiểm tra: ${newQuiz.title}`);
    return newQuiz;
  };

  // QUESTION BANK
  const addQuestionBankItem = (qData: Omit<QuizQuestion, 'id'>) => {
    const newItem: QuizQuestion = {
      ...qData,
      id: `qb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: qData.createdAt || new Date().toISOString(),
    };
    StorageService.addQuestionBankItem(newItem);
    FirestoreSyncService.saveDoc('question_bank', newItem.id, newItem).catch(() => {});
    setQuestionBank(StorageService.getQuestionBank());
    showToast('success', 'Đã lưu câu hỏi vào Ngân hàng thành công!');
    return newItem;
  };

  const updateQuestionBankItem = (id: string, updates: Partial<QuizQuestion>) => {
    StorageService.updateQuestionBankItem(id, updates);
    FirestoreSyncService.saveDoc('question_bank', id, updates).catch(() => {});
    setQuestionBank(StorageService.getQuestionBank());
    showToast('success', 'Đã cập nhật câu hỏi thành công!');
  };

  const deleteQuestionBankItem = (id: string) => {
    StorageService.deleteQuestionBankItem(id);
    FirestoreSyncService.deleteDoc('question_bank', id).catch(() => {});
    setQuestionBank(StorageService.getQuestionBank());
    showToast('info', 'Đã xóa câu hỏi khỏi Ngân hàng.');
  };

  const importQuestionBankItems = (items: QuizQuestion[]) => {
    const merged = StorageService.importQuestionBankItems(items);
    setQuestionBank(merged);
    showToast('success', `Đã import thành công ${items.length} câu hỏi vào Ngân hàng!`);
    return items.length;
  };

  // RESOURCES
  const addResource = (rData: Omit<LearningResource, 'id' | 'createdAt' | 'downloads'>) => {
    const newRes: LearningResource = {
      ...rData,
      id: `res-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      downloads: 0,
    };
    StorageService.addResource(newRes);
    setResources(StorageService.getResources());
    showToast('success', `Đã đăng tải học liệu: ${newRes.title}`);
    return newRes;
  };

  const deleteResource = (id: string) => {
    StorageService.deleteResource(id);
    setResources(StorageService.getResources());
    showToast('info', 'Đã xóa học liệu');
  };

  const toggleFavoriteResource = (id: string) => {
    const item = resources.find(r => r.id === id);
    if (!item) return;
    const updated = resources.map(r => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
    StorageService.saveResources(updated);
    setResources(updated);
  };

  // BEHAVIORS
  const addBehaviorRecord = (rec: Omit<BehaviorRecord, 'id' | 'date'>) => {
    const newRec: BehaviorRecord = {
      ...rec,
      id: `beh-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
    };
    StorageService.addBehavior(newRec);
    setBehaviors(StorageService.getBehaviors());

    // Update student reward points
    const st = students.find(s => s.id === rec.studentId);
    if (st) {
      const newPoints = Math.max(0, st.rewardPoints + rec.points);
      updateStudent(st.id, { rewardPoints: newPoints });
    }

    showToast('success', `Đã ghi nhận: ${rec.title} (${rec.points > 0 ? `+${rec.points}` : rec.points} điểm)`);
  };

  // REWARDS
  const addRewardBadge = (badge: Omit<RewardBadge, 'id' | 'awardedDate'>) => {
    const newBadge: RewardBadge = {
      ...badge,
      id: `rew-${Date.now().toString(36)}`,
      awardedDate: new Date().toISOString().split('T')[0],
    };
    StorageService.addReward(newBadge);
    setRewards(StorageService.getRewards());
    showToast('success', `Đã vinh danh và trao huy hiệu: ${badge.title}`);
  };

  // ALERTS
  const updateAlertStatus = (id: string, status: SystemAlert['status']) => {
    StorageService.updateAlertStatus(id, status);
    setAlerts(StorageService.getAlerts());
    showToast('success', 'Đã cập nhật trạng thái cảnh báo');
  };

  // ANNOUNCEMENTS
  const addAnnouncement = (ancData: Omit<Announcement, 'id' | 'createdAt' | 'readCount' | 'totalRecipients'>) => {
    const newAnc: Announcement = {
      ...ancData,
      id: `anc-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      readCount: 1,
      totalRecipients: selectedClass?.studentCount || 38,
    };
    StorageService.addAnnouncement(newAnc);
    setAnnouncements(StorageService.getAnnouncements());
    showToast('success', `Đã phát thông báo: ${newAnc.title}`);
  };

  // LEAVE REQUESTS
  const addLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...reqData,
      id: `lr-${Date.now().toString(36)}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    StorageService.addLeaveRequest(newReq);
    setLeaveRequests(StorageService.getLeaveRequests());

    // Notify teacher
    StorageService.addNotification({
      userId: 'u-teacher-1',
      title: 'Đơn xin phép nghỉ học mới',
      message: `Phụ huynh của ${reqData.studentName} vừa gửi đơn xin phép nghỉ từ ${reqData.fromDate} đến ${reqData.toDate}.`,
      type: 'message',
      linkUrl: '/teacher/attendance',
    });
    setNotifications(StorageService.getNotifications());
    showToast('success', 'Đã gửi đơn xin phép nghỉ học tới giáo viên chủ nhiệm!');
  };

  const respondLeaveRequest = (id: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
    StorageService.updateLeaveRequest(id, {
      status,
      respondedBy: currentUser.name,
      responseNote: note,
    });
    setLeaveRequests(StorageService.getLeaveRequests());
    showToast('success', status === 'APPROVED' ? 'Đã duyệt đơn nghỉ phép' : 'Đã từ chối đơn nghỉ phép');
  };

  // MESSAGES
  const sendMessage = (subject: string, message: string, teacherId: string, teacherName: string) => {
    const newMsg: ParentFeedbackMessage = {
      id: `msg-${Date.now().toString(36)}`,
      parentId: currentUser.id,
      parentName: currentUser.name,
      studentId: currentUser.parentChildrenIds?.[0] || 'hs-1',
      studentName: 'Lê Hải Đăng',
      teacherId,
      teacherName,
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    StorageService.addMessage(newMsg);
    setMessages(StorageService.getMessages());
    showToast('success', 'Đã gửi tin nhắn tới Thầy/Cô thành công!');
  };

  const replyMessage = (id: string, reply: string) => {
    StorageService.replyMessage(id, reply);
    setMessages(StorageService.getMessages());
    showToast('success', 'Đã phản hồi ý kiến phụ huynh thành công!');
  };

  // NOTIFICATIONS
  const markNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const markAllNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
    showToast('info', 'Đã đánh dấu đã đọc tất cả thông báo');
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    StorageService.addNotification(item);
    setNotifications(StorageService.getNotifications());
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // SCHEDULE ACTIONS
  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    const newItem = StorageService.addScheduleItem(itemData);
    setSchedule(StorageService.getSchedule());
    showToast('success', `Đã thêm tiết ${newItem.subject} (${newItem.session === 'MORNING' ? 'Buổi Sáng' : 'Buổi Chiều'})!`);
    return newItem;
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    StorageService.updateScheduleItem(id, updates);
    setSchedule(StorageService.getSchedule());
    showToast('success', 'Đã cập nhật tiết học thời khóa biểu!');
  };

  const deleteScheduleItem = (id: string) => {
    if (!isDeleteEnabled) {
      showToast('warning', 'Chức năng xóa đang bị TẮT! Hãy bật chế độ xóa ở thanh công cụ để thực hiện.');
      return;
    }
    StorageService.deleteScheduleItem(id);
    setSchedule(StorageService.getSchedule());
    showToast('info', 'Đã xóa tiết học khỏi thời khóa biểu');
  };

  const resetSchedule = () => {
    const list = StorageService.resetSchedule();
    setSchedule(list);
    showToast('success', 'Đã khôi phục thời khóa biểu chuẩn sáng & chiều!');
  };

  const saveSchedule = (data: ScheduleItem[]) => {
    StorageService.saveSchedule(data);
    setSchedule(data);
    showToast('success', 'Đã lưu thời khóa biểu tuần!');
  };

  return (
    <AppContext.Provider
      value={{
        classes,
        selectedClassId,
        setSelectedClassId,
        selectedClass,
        students,
        attendance,
        grades,
        assignments,
        submissions,
        quizzes,
        questionBank,
        resources,
        behaviors,
        rewards,
        alerts,
        announcements,
        leaveRequests,
        messages,
        auditLogs,
        notifications,
        unreadNotificationCount,
        schedule,

        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        resetSchedule,
        saveSchedule,

        addClass,
        updateClass,
        deleteClass,
        archiveClass,

        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,

        saveAttendanceBatch,
        saveGradesBatch,
        updateGradeItem,

        addAssignment,
        updateAssignment,
        deleteAssignment,
        gradeSubmission,
        submitAssignmentStudent,

        addQuiz,
        addQuestionBankItem,
        updateQuestionBankItem,
        deleteQuestionBankItem,
        importQuestionBankItems,
        addResource,
        deleteResource,
        toggleFavoriteResource,

        addBehaviorRecord,
        addRewardBadge,
        updateAlertStatus,

        addAnnouncement,
        addLeaveRequest,
        respondLeaveRequest,
        sendMessage,
        replyMessage,

        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        activeTool,
        setActiveTool,

        isDeleteEnabled,
        setIsDeleteEnabled,
        toggleDeleteMode,

        toasts,
        showToast,
        dismissToast,

        reloadAllData,
        resetDatabaseToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
