export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type AttendanceStatus = 'PRESENT' | 'EXCUSED' | 'UNEXCUSED' | 'LATE' | 'EARLY_LEAVE';

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'REDO_REQUIRED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED';

export type BehaviorType = 'POSITIVE' | 'NEEDS_IMPROVEMENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  gender?: 'Nam' | 'Nữ';
  address?: string;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  // Specific role links
  studentId?: string; // If user is student
  teacherId?: string; // If user is teacher
  parentChildrenIds?: string[]; // If user is parent, list of linked student IDs
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: number; // e.g., 6, 7, 8, 9
  academicYear: string; // e.g. "2024-2025"
  room: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  maxStudents: number;
  joinCode: string;
  isJoinLocked: boolean;
  isArchived: boolean;
  subject?: string;
  description?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. "HS240901"
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  avatar?: string;
  parentName: string;
  parentPhone: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherJob?: string;
  motherName?: string;
  motherPhone?: string;
  motherJob?: string;
  primaryContact?: 'father' | 'mother' | 'guardian';
  parentEmail?: string;
  parentNotes?: string;
  parentLinked?: boolean;
  orderNumber?: number;
  studyGroup?: string;
  email?: string;
  address: string;
  status: 'STUDYING' | 'SUSPENDED' | 'TRANSFERRED' | 'DROPPED';
  conduct: 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
  gpa: number;
  rewardPoints: number;
  notes?: string;
  attendanceRate: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  period: number; // Tiết 1 - 5
  classId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: number; // 2 (Thứ 2) to 7 (Thứ 7)
  session: 'MORNING' | 'AFTERNOON'; // Buổi sáng hoặc Buổi chiều
  period: number; // 1 to 5 (sáng: 1-5), 1 to 4 (chiều: 1-4 hoặc 6-9)
  subject: string;
  teacherName: string;
  room: string;
  timeSlot: string; // e.g. "07:15 - 08:00" hoặc "13:30 - 14:15"
  notes?: string;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subject: string;
  oral1?: number; // Điểm miệng 1
  oral2?: number; // Điểm miệng 2
  test15m1?: number; // Điểm 15 phút
  test15m2?: number; // Điểm 15 phút
  midTerm?: number; // Điểm giữa kỳ
  finalTerm?: number; // Điểm cuối kỳ
  average?: number; // Điểm trung bình môn
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  dueDate: string; // ISO date string
  assignedDate: string;
  maxScore: number;
  targetType: 'ALL' | 'GROUP' | 'INDIVIDUAL';
  targetStudentIds?: string[];
  attachments?: { name: string; size: string; url: string }[];
  isDraft: boolean;
  submissionCount: number;
  gradedCount: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: SubmissionStatus;
  content: string;
  attachments?: { name: string; size: string; url: string }[];
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export type QuestionType =
  | 'SINGLE' // Trắc nghiệm 1 đáp án
  | 'MULTIPLE' // Nhiều đáp án
  | 'TRUE_FALSE' // Đúng/Sai theo từng ý (a, b, c, d)
  | 'MATCHING' // Ghép đôi (Cột A - Cột B)
  | 'ORDERING' // Sắp xếp thứ tự
  | 'FILL_BLANK' // Điền khuyết
  | 'SHORT_ANSWER' // Trả lời ngắn
  | 'ESSAY' // Tự luận
  | 'PASSAGE_BASED'; // Câu hỏi theo đoạn văn / tình huống

export type DifficultyLevel = 'NHAN_BIET' | 'THONG_HIEU' | 'VAN_DUNG' | 'VAN_DUNG_CAO';

export interface QuizQuestion {
  id: string;
  code?: string;
  question: string;
  type: QuestionType;
  difficulty?: DifficultyLevel;
  subject?: string;
  gradeLevel?: number;
  topic?: string;
  passage?: string; // Đoạn văn / ngữ liệu tình huống
  options?: string[]; // Dùng cho SINGLE, MULTIPLE
  subQuestions?: { id: string; text: string; correctAnswer: boolean }[]; // Dùng cho TRUE_FALSE từng ý
  pairs?: { id: string; left: string; right: string }[]; // Dùng cho MATCHING
  orderingItems?: string[]; // Dùng cho ORDERING
  correctAnswer: any; // string | string[] | boolean | Record<string, boolean>
  explanation?: string; // Lời giải chi tiết
  points: number;
  tags?: string[];
  createdAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  classId: string;
  className: string;
  subject: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questions: QuizQuestion[];
  totalPoints: number;
  isPublished: boolean;
  attemptsCount: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  startedAt: string;
  completedAt: string;
  answers: Record<string, any>;
}

export interface LearningResource {
  id: string;
  title: string;
  gradeLevel: number;
  subject: string;
  chapter: string;
  lesson: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'video' | 'link';
  fileSize?: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  isFavorite?: boolean;
  downloads: number;
  description?: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  type: BehaviorType;
  title: string;
  points: number; // +5 or -5
  notes?: string;
  teacherName: string;
}

export interface RewardBadge {
  id: string;
  title: string;
  category: 'Ngôi sao tuần' | 'Chăm chỉ' | 'Tiến bộ vượt bậc' | 'Chuyên cần vàng' | 'Thiện nguyện';
  icon: string;
  studentId: string;
  studentName: string;
  className: string;
  awardedDate: string;
  reason: string;
  awardedBy: string;
}

export interface SystemAlert {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  conditionType: 'ABSENCE_HIGH' | 'LOW_GRADE' | 'MISSING_ASSIGNMENTS' | 'LATE_FREQUENT';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  targetRole: 'ALL' | 'STUDENTS' | 'PARENTS' | 'TEACHERS';
  classId?: string;
  className?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  attachments?: { name: string; url: string }[];
  readCount: number;
  totalRecipients: number;
}

export interface ParentFeedbackMessage {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  message: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  status: 'PENDING' | 'REPLIED';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  respondedBy?: string;
  responseNote?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string; // e.g. "grades.update", "attendance.mark", "class.delete"
  module: string;
  targetName: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'attendance' | 'alert' | 'system' | 'message';
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}
