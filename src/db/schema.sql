-- ====================================================================
-- EDUSMART - DATABASE ARCHITECTURE & SUPABASE POSTGRESQL SCHEMA
-- Ready for Production Multi-tenant & Row Level Security (RLS)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHOOLS / ORGANIZATIONS (Multi-tenant ready)
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACADEMIC YEARS & SEMESTERS
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    year_code VARCHAR(20) NOT NULL, -- e.g. '2024-2025'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROLES & PERMISSIONS
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    UNIQUE(module, action)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);

-- 5. USERS & PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    gender VARCHAR(10),
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 6. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    room VARCHAR(50),
    subject VARCHAR(100),
    homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    student_count INT DEFAULT 0,
    max_students INT DEFAULT 45,
    join_code VARCHAR(20) UNIQUE NOT NULL,
    is_join_locked BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. STUDENTS & PARENT RELATIONS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    conduct VARCHAR(20) DEFAULT 'Tốt',
    reward_points INT DEFAULT 0,
    attendance_rate NUMERIC(5,2) DEFAULT 100.0,
    gpa NUMERIC(3,1) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parent_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Phụ huynh',
    UNIQUE(parent_profile_id, student_id)
);

-- 8. ATTENDANCE SESSIONS & RECORDS
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'EXCUSED', 'UNEXCUSED', 'LATE', 'EARLY_LEAVE');

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
    status attendance_status DEFAULT 'PRESENT',
    note TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id, session_date, period)
);

-- 9. TIMETABLE SCHEDULES
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 2 AND 7), -- 2: Thứ 2, 7: Thứ 7
    period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
    subject VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(100),
    room VARCHAR(50),
    time_slot VARCHAR(50)
);

-- 10. ASSIGNMENTS & SUBMISSIONS
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    assigned_date TIMESTAMPTZ DEFAULT NOW(),
    max_score NUMERIC(4,1) DEFAULT 10.0,
    target_type VARCHAR(20) DEFAULT 'ALL',
    is_draft BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'SUBMITTED',
    content TEXT,
    attachments JSONB DEFAULT '[]',
    score NUMERIC(4,1),
    feedback TEXT,
    graded_by UUID REFERENCES profiles(id),
    graded_at TIMESTAMPTZ,
    UNIQUE(assignment_id, student_id)
);

-- 11. QUIZZES & QUESTIONS
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    duration_minutes INT DEFAULT 15,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    total_points NUMERIC(4,1) DEFAULT 10.0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'SINGLE',
    options JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    points NUMERIC(3,1) DEFAULT 2.5,
    sort_order INT DEFAULT 0
);

-- 12. LEARNING RESOURCES
CREATE TABLE learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade_level INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(255),
    lesson VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size VARCHAR(50),
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SPREADSHEET GRADE ITEMS
CREATE TABLE grade_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    oral1 NUMERIC(3,1),
    oral2 NUMERIC(3,1),
    test15m1 NUMERIC(3,1),
    test15m2 NUMERIC(3,1),
    mid_term NUMERIC(3,1),
    final_term NUMERIC(3,1),
    average NUMERIC(3,1),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id, subject)
);

-- 14. BEHAVIOR LOGS & REWARDS
CREATE TABLE behavior_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    record_date DATE DEFAULT CURRENT_DATE,
    behavior_type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    notes TEXT,
    teacher_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    awarded_date DATE DEFAULT CURRENT_DATE,
    awarded_by VARCHAR(100)
);

-- 15. ALERTS & ANNOUNCEMENTS
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(100),
    target_role VARCHAR(20) DEFAULT 'ALL',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOGS (Immutable security trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    target_name VARCHAR(255),
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view/edit everything
CREATE POLICY admin_all_profiles ON profiles FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- Teachers can view and edit their own classes and students
CREATE POLICY teacher_classes ON classes FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'TEACHER' AND
    (homeroom_teacher_id = auth.uid() OR id IN (
        SELECT class_id FROM classes WHERE homeroom_teacher_id = auth.uid()
    ))
);

-- Students can only view their own records
CREATE POLICY student_own_submissions ON submissions FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

-- Parents can only view their linked children
CREATE POLICY parent_children_grades ON grade_items FOR SELECT USING (
    student_id IN (SELECT student_id FROM parent_students WHERE parent_profile_id = auth.uid())
);

-- Audit logs are read-only for Admin, insert-only for others
CREATE POLICY audit_view_admin ON audit_logs FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY audit_insert_all ON audit_logs FOR INSERT WITH CHECK (true);

-- INDEXES FOR FAST QUERY PERFORMANCE
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_attendance_lookup ON attendance_records(class_id, session_date, period);
CREATE INDEX idx_grades_student ON grade_items(student_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(created_at DESC);
