import {
  User,
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
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZZES,
  INITIAL_QUESTION_BANK,
  INITIAL_RESOURCES,
  INITIAL_BEHAVIORS,
  INITIAL_REWARDS,
  INITIAL_ALERTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHEDULE,
} from '../data/mockData';

const STORAGE_PREFIX = 'edusmart_';

function loadOrInit<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to read ${key} from storage:`, e);
    return initialData;
  }
}

function save<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Reset all
  resetAll: () => {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'classes');
    localStorage.removeItem(STORAGE_PREFIX + 'students');
    localStorage.removeItem(STORAGE_PREFIX + 'attendance');
    localStorage.removeItem(STORAGE_PREFIX + 'grades');
    localStorage.removeItem(STORAGE_PREFIX + 'assignments');
    localStorage.removeItem(STORAGE_PREFIX + 'submissions');
    localStorage.removeItem(STORAGE_PREFIX + 'quizzes');
    localStorage.removeItem(STORAGE_PREFIX + 'resources');
    localStorage.removeItem(STORAGE_PREFIX + 'behaviors');
    localStorage.removeItem(STORAGE_PREFIX + 'rewards');
    localStorage.removeItem(STORAGE_PREFIX + 'alerts');
    localStorage.removeItem(STORAGE_PREFIX + 'announcements');
    localStorage.removeItem(STORAGE_PREFIX + 'leave_requests');
    localStorage.removeItem(STORAGE_PREFIX + 'messages');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'notifications');
  },

  // USERS
  getUsers: (): User[] => loadOrInit('users', INITIAL_USERS),
  saveUsers: (data: User[]) => save('users', data),
  addUser: (user: User) => {
    const list = StorageService.getUsers();
    list.unshift(user);
    save('users', list);
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const list = StorageService.getUsers().map(u => (u.id === id ? { ...u, ...updates } : u));
    save('users', list);
  },

  // CLASSES
  getClasses: (): SchoolClass[] => {
    const list = loadOrInit('classes', INITIAL_CLASSES);
    if (!list.some(c => c.id === 'cls-6a1')) {
      const cls6 = INITIAL_CLASSES.find(c => c.id === 'cls-6a1');
      if (cls6) list.unshift(cls6);
      save('classes', list);
    }
    return list;
  },
  saveClasses: (data: SchoolClass[]) => save('classes', data),
  addClass: (cls: SchoolClass) => {
    const list = StorageService.getClasses();
    list.unshift(cls);
    save('classes', list);
    return cls;
  },
  updateClass: (id: string, updates: Partial<SchoolClass>) => {
    const list = StorageService.getClasses().map(c => (c.id === id ? { ...c, ...updates } : c));
    save('classes', list);
  },
  deleteClass: (id: string) => {
    const list = StorageService.getClasses().filter(c => c.id !== id);
    save('classes', list);
  },

  // STUDENTS
  getStudents: (): Student[] => {
    const list = loadOrInit('students', INITIAL_STUDENTS);
    const initialIds = INITIAL_STUDENTS.map(s => s.id);
    const updated = INITIAL_STUDENTS.map(init => {
      const existing = list.find(s => s.id === init.id);
      return existing
        ? {
            ...init,
            ...existing,
            parentName: existing.parentName || init.parentName,
            parentPhone: existing.parentPhone || init.parentPhone,
            parentLinked: existing.parentLinked !== undefined ? existing.parentLinked : init.parentLinked,
          }
        : init;
    });
    const extra = list.filter(s => !initialIds.includes(s.id));
    return [...updated, ...extra];
  },
  saveStudents: (data: Student[]) => save('students', data),
  addStudent: (student: Student) => {
    const list = StorageService.getStudents();
    list.unshift(student);
    save('students', list);
    return student;
  },
  updateStudent: (id: string, updates: Partial<Student>) => {
    const list = StorageService.getStudents().map(s => (s.id === id ? { ...s, ...updates } : s));
    save('students', list);
  },
  deleteStudent: (id: string) => {
    const list = StorageService.getStudents().filter(s => s.id !== id);
    save('students', list);
  },

  // ATTENDANCE
  getAttendance: (): AttendanceRecord[] => loadOrInit('attendance', INITIAL_ATTENDANCE),
  saveAttendance: (records: AttendanceRecord[]) => {
    const current = StorageService.getAttendance();
    const updatedMap = new Map(current.map(r => [r.id, r]));
    records.forEach(r => updatedMap.set(r.id, r));
    const merged = Array.from(updatedMap.values());
    save('attendance', merged);
  },

  // GRADES
  getGrades: (): GradeItem[] => loadOrInit('grades', INITIAL_GRADES),
  saveGrades: (data: GradeItem[]) => save('grades', data),
  updateGradeItem: (id: string, updates: Partial<GradeItem>) => {
    const list = StorageService.getGrades().map(g => {
      if (g.id === id) {
        const updated = { ...g, ...updates };
        // Recalculate average
        const scores = [updated.oral1, updated.oral2, updated.test15m1, updated.test15m2, updated.midTerm, updated.finalTerm].filter(
          (s): s is number => typeof s === 'number' && !isNaN(s)
        );
        if (scores.length > 0) {
          // Weighted: regular*1, mid*2, final*3
          let sum = 0;
          let weight = 0;
          if (updated.oral1 !== undefined) { sum += updated.oral1; weight += 1; }
          if (updated.oral2 !== undefined) { sum += updated.oral2; weight += 1; }
          if (updated.test15m1 !== undefined) { sum += updated.test15m1; weight += 1; }
          if (updated.test15m2 !== undefined) { sum += updated.test15m2; weight += 1; }
          if (updated.midTerm !== undefined) { sum += updated.midTerm * 2; weight += 2; }
          if (updated.finalTerm !== undefined) { sum += updated.finalTerm * 3; weight += 3; }
          updated.average = Number((sum / weight).toFixed(1));
        }
        return updated;
      }
      return g;
    });
    save('grades', list);
  },

  // ASSIGNMENTS
  getAssignments: (): Assignment[] => loadOrInit('assignments', INITIAL_ASSIGNMENTS),
  saveAssignments: (data: Assignment[]) => save('assignments', data),
  addAssignment: (asg: Assignment) => {
    const list = StorageService.getAssignments();
    list.unshift(asg);
    save('assignments', list);
    return asg;
  },
  updateAssignment: (id: string, updates: Partial<Assignment>) => {
    const list = StorageService.getAssignments().map(a => (a.id === id ? { ...a, ...updates } : a));
    save('assignments', list);
  },
  deleteAssignment: (id: string) => {
    const list = StorageService.getAssignments().filter(a => a.id !== id);
    save('assignments', list);
  },

  // SUBMISSIONS
  getSubmissions: (): Submission[] => loadOrInit('submissions', INITIAL_SUBMISSIONS),
  saveSubmissions: (data: Submission[]) => save('submissions', data),
  addOrUpdateSubmission: (sub: Submission) => {
    const list = StorageService.getSubmissions();
    const idx = list.findIndex(s => s.id === sub.id || (s.assignmentId === sub.assignmentId && s.studentId === sub.studentId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...sub };
    } else {
      list.unshift(sub);
    }
    save('submissions', list);
  },

  // QUIZZES
  getQuizzes: (): Quiz[] => loadOrInit('quizzes', INITIAL_QUIZZES),
  saveQuizzes: (data: Quiz[]) => save('quizzes', data),
  addQuiz: (quiz: Quiz) => {
    const list = StorageService.getQuizzes();
    list.unshift(quiz);
    save('quizzes', list);
    return quiz;
  },

  // QUESTION BANK
  getQuestionBank: (): QuizQuestion[] => loadOrInit('question_bank', INITIAL_QUESTION_BANK),
  saveQuestionBank: (data: QuizQuestion[]) => save('question_bank', data),
  addQuestionBankItem: (item: QuizQuestion) => {
    const list = StorageService.getQuestionBank();
    list.unshift(item);
    save('question_bank', list);
    return item;
  },
  updateQuestionBankItem: (id: string, updates: Partial<QuizQuestion>) => {
    const list = StorageService.getQuestionBank().map(q => (q.id === id ? { ...q, ...updates } : q));
    save('question_bank', list);
  },
  deleteQuestionBankItem: (id: string) => {
    const list = StorageService.getQuestionBank().filter(q => q.id !== id);
    save('question_bank', list);
  },
  importQuestionBankItems: (items: QuizQuestion[]) => {
    const current = StorageService.getQuestionBank();
    const merged = [...items, ...current];
    save('question_bank', merged);
    return merged;
  },

  // RESOURCES
  getResources: (): LearningResource[] => loadOrInit('resources', INITIAL_RESOURCES),
  saveResources: (data: LearningResource[]) => save('resources', data),
  addResource: (res: LearningResource) => {
    const list = StorageService.getResources();
    list.unshift(res);
    save('resources', list);
    return res;
  },
  deleteResource: (id: string) => {
    const list = StorageService.getResources().filter(r => r.id !== id);
    save('resources', list);
  },

  // BEHAVIORS
  getBehaviors: (): BehaviorRecord[] => loadOrInit('behaviors', INITIAL_BEHAVIORS),
  addBehavior: (record: BehaviorRecord) => {
    const list = StorageService.getBehaviors();
    list.unshift(record);
    save('behaviors', list);
    return record;
  },

  // REWARDS
  getRewards: (): RewardBadge[] => loadOrInit('rewards', INITIAL_REWARDS),
  addReward: (badge: RewardBadge) => {
    const list = StorageService.getRewards();
    list.unshift(badge);
    save('rewards', list);
    return badge;
  },

  // ALERTS
  getAlerts: (): SystemAlert[] => loadOrInit('alerts', INITIAL_ALERTS),
  updateAlertStatus: (id: string, status: SystemAlert['status']) => {
    const list = StorageService.getAlerts().map(a => (a.id === id ? { ...a, status } : a));
    save('alerts', list);
  },

  // ANNOUNCEMENTS
  getAnnouncements: (): Announcement[] => loadOrInit('announcements', INITIAL_ANNOUNCEMENTS),
  addAnnouncement: (anc: Announcement) => {
    const list = StorageService.getAnnouncements();
    list.unshift(anc);
    save('announcements', list);
    return anc;
  },

  // LEAVE REQUESTS
  getLeaveRequests: (): LeaveRequest[] => loadOrInit('leave_requests', INITIAL_LEAVE_REQUESTS),
  addLeaveRequest: (req: LeaveRequest) => {
    const list = StorageService.getLeaveRequests();
    list.unshift(req);
    save('leave_requests', list);
    return req;
  },
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => {
    const list = StorageService.getLeaveRequests().map(r => (r.id === id ? { ...r, ...updates } : r));
    save('leave_requests', list);
  },

  // MESSAGES
  getMessages: (): ParentFeedbackMessage[] => loadOrInit('messages', INITIAL_MESSAGES),
  addMessage: (msg: ParentFeedbackMessage) => {
    const list = StorageService.getMessages();
    list.unshift(msg);
    save('messages', list);
    return msg;
  },
  replyMessage: (id: string, reply: string) => {
    const list = StorageService.getMessages().map(m =>
      m.id === id ? { ...m, reply, repliedAt: new Date().toISOString(), status: 'REPLIED' as const } : m
    );
    save('messages', list);
  },

  // AUDIT LOGS
  getAuditLogs: (): AuditLog[] => loadOrInit('audit_logs', INITIAL_AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const list = StorageService.getAuditLogs();
    const entry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(entry);
    save('audit_logs', list.slice(0, 500)); // Keep last 500 entries
    return entry;
  },

  // NOTIFICATIONS
  getNotifications: (): NotificationItem[] => loadOrInit('notifications', INITIAL_NOTIFICATIONS),
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const list = StorageService.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(newNotif);
    save('notifications', list);
    return newNotif;
  },
  markNotificationRead: (id: string) => {
    const list = StorageService.getNotifications().map(n => (n.id === id ? { ...n, isRead: true } : n));
    save('notifications', list);
  },
  markAllNotificationsRead: () => {
    const list = StorageService.getNotifications().map(n => ({ ...n, isRead: true }));
    save('notifications', list);
  },

  // SCHEDULE (THỜI KHÓA BIỂU SÁNG & CHIỀU)
  getSchedule: (): ScheduleItem[] => loadOrInit('schedule', INITIAL_SCHEDULE),
  saveSchedule: (data: ScheduleItem[]) => save('schedule', data),
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => {
    const list = StorageService.getSchedule();
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    list.push(newItem);
    save('schedule', list);
    return newItem;
  },
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => {
    const list = StorageService.getSchedule().map(s => (s.id === id ? { ...s, ...updates } : s));
    save('schedule', list);
    return list.find(s => s.id === id);
  },
  deleteScheduleItem: (id: string) => {
    const list = StorageService.getSchedule().filter(s => s.id !== id);
    save('schedule', list);
  },
  resetSchedule: () => {
    save('schedule', INITIAL_SCHEDULE);
    return INITIAL_SCHEDULE;
  },
};
