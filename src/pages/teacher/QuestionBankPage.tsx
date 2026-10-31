import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QuizQuestion, QuestionType, DifficultyLevel } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AiService } from '../../services/aiService';
import * as XLSX from 'xlsx';
import {
  HelpCircle,
  Plus,
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Layers,
  BookOpen,
  ArrowRight,
  ListPlus,
  RefreshCw,
  Printer,
  ChevronDown,
  Check,
  X,
  FileDown,
  SlidersHorizontal,
  Bot,
  Info,
} from 'lucide-react';

// Question Type Labels and Badges
export const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  { label: string; shortLabel: string; color: string; bgColor: string; borderColor: string }
> = {
  SINGLE: {
    label: 'Trắc nghiệm 1 đáp án',
    shortLabel: '1 Đáp án',
    color: 'text-sky-300',
    bgColor: 'bg-sky-950/60',
    borderColor: 'border-sky-800/60',
  },
  MULTIPLE: {
    label: 'Trắc nghiệm nhiều đáp án',
    shortLabel: 'Nhiều đáp án',
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-950/60',
    borderColor: 'border-indigo-800/60',
  },
  TRUE_FALSE: {
    label: 'Đúng / Sai theo từng ý (a, b, c, d)',
    shortLabel: 'Đúng / Sai từng ý',
    color: 'text-amber-300',
    bgColor: 'bg-amber-950/60',
    borderColor: 'border-amber-800/60',
  },
  MATCHING: {
    label: 'Ghép đôi (Cột A - Cột B)',
    shortLabel: 'Ghép đôi',
    color: 'text-teal-300',
    bgColor: 'bg-teal-950/60',
    borderColor: 'border-teal-800/60',
  },
  ORDERING: {
    label: 'Sắp xếp thứ tự quy trình',
    shortLabel: 'Sắp xếp',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-950/60',
    borderColor: 'border-cyan-800/60',
  },
  FILL_BLANK: {
    label: 'Điền khuyết vào chỗ trống',
    shortLabel: 'Điền khuyết',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-800/60',
  },
  SHORT_ANSWER: {
    label: 'Trả lời ngắn',
    shortLabel: 'Trả lời ngắn',
    color: 'text-blue-300',
    bgColor: 'bg-blue-950/60',
    borderColor: 'border-blue-800/60',
  },
  ESSAY: {
    label: 'Tự luận có thang điểm & barem',
    shortLabel: 'Tự luận',
    color: 'text-rose-300',
    bgColor: 'bg-rose-950/60',
    borderColor: 'border-rose-800/60',
  },
  PASSAGE_BASED: {
    label: 'Câu hỏi theo ngữ liệu / Đoạn văn',
    shortLabel: 'Ngữ liệu đoạn văn',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/60',
    borderColor: 'border-purple-800/60',
  },
};

// Difficulty Configurations
export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  NHAN_BIET: {
    label: 'Nhận biết',
    color: 'text-emerald-300',
    bg: 'bg-emerald-950/50',
    border: 'border-emerald-800/60',
  },
  THONG_HIEU: {
    label: 'Thông hiểu',
    color: 'text-cyan-300',
    bg: 'bg-cyan-950/50',
    border: 'border-cyan-800/60',
  },
  VAN_DUNG: {
    label: 'Vận dụng',
    color: 'text-amber-300',
    bg: 'bg-amber-950/50',
    border: 'border-amber-800/60',
  },
  VAN_DUNG_CAO: {
    label: 'Vận dụng cao',
    color: 'text-rose-300',
    bg: 'bg-rose-950/50',
    border: 'border-rose-800/60',
  },
};

const SUBJECT_LIST = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Khoa học tự nhiên (Vật lý)',
  'Khoa học tự nhiên (Hóa học)',
  'Khoa học tự nhiên (Sinh học)',
  'Lịch sử & Địa lý',
  'Tin học',
  'Giáo dục công dân',
];

export const QuestionBankPage: React.FC = () => {
  const {
    questionBank,
    addQuestionBankItem,
    updateQuestionBankItem,
    deleteQuestionBankItem,
    importQuestionBankItems,
    isDeleteEnabled,
    showToast,
    addQuiz,
    selectedClass,
  } = useApp();

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Selection state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBatchAddModalOpen, setIsBatchAddModalOpen] = useState(false);
  const [isCreateSingleModalOpen, setIsCreateSingleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // --- AI GENERATION STATE ---
  const [aiTopic, setAiTopic] = useState('');
  const [aiLessonContent, setAiLessonContent] = useState('');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState(9);
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulties, setAiDifficulties] = useState<DifficultyLevel[]>([
    'NHAN_BIET',
    'THONG_HIEU',
    'VAN_DUNG',
  ]);
  const [aiTypes, setAiTypes] = useState<QuestionType[]>([
    'SINGLE',
    'MULTIPLE',
    'TRUE_FALSE',
    'FILL_BLANK',
  ]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedProposals, setAiGeneratedProposals] = useState<QuizQuestion[]>([]);
  const [approvedProposalIds, setApprovedProposalIds] = useState<Set<string>>(new Set());
  const [aiStep, setAiStep] = useState<'input' | 'review'>('input');

  // --- IMPORT MODAL STATE ---
  const [importTab, setImportTab] = useState<'excel' | 'word'>('excel');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedImportRows, setParsedImportRows] = useState<
    {
      rowNumber: number;
      question: QuizQuestion;
      isValid: boolean;
      errors: string[];
      isDuplicate: boolean;
      duplicateReason?: string;
    }[]
  >([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [wordImportText, setWordImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BATCH ADD STATE ---
  const [batchRawText, setBatchRawText] = useState(
    `[Câu 1] Định lý nào sau đây chứng minh bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông?
A. Định lý Thales
B. Định lý Pytago
C. Định lý Euclid
D. Định lý Cosin
Đáp án: B
Lời giải: Trong tam giác vuông, định lý Pytago khẳng định: a^2 + b^2 = c^2.

[Câu 2] Cho hình vuông có cạnh bằng 5 cm. Đường chéo của hình vuông đó có độ dài là:
A. 10 cm
B. 5√2 cm
C. 25 cm
D. 5√3 cm
Đáp án: B
Lời giải: Áp dụng định lý Pytago: d = √(5^2 + 5^2) = √50 = 5√2 cm.`
  );
  const [batchSubject, setBatchSubject] = useState('Toán học');
  const [batchGrade, setBatchGrade] = useState(9);
  const [batchTopic, setBatchTopic] = useState('Hình học cơ bản');

  // --- SINGLE QUESTION FORM STATE ---
  const [formCode, setFormCode] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formSubject, setFormSubject] = useState('Toán học');
  const [formGrade, setFormGrade] = useState(9);
  const [formTopic, setFormTopic] = useState('');
  const [formType, setFormType] = useState<QuestionType>('SINGLE');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('NHAN_BIET');
  const [formPassage, setFormPassage] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>([
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D',
  ]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<any>('Phương án A');
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState(1.0);
  const [formSubQuestions, setFormSubQuestions] = useState<
    { id: string; text: string; correctAnswer: boolean }[]
  >([
    { id: 'sub-1', text: 'a) Mệnh đề đầu tiên', correctAnswer: true },
    { id: 'sub-2', text: 'b) Mệnh đề thứ hai', correctAnswer: false },
    { id: 'sub-3', text: 'c) Mệnh đề thứ ba', correctAnswer: true },
    { id: 'sub-4', text: 'd) Mệnh đề thứ tư', correctAnswer: false },
  ]);
  const [formPairs, setFormPairs] = useState<{ id: string; left: string; right: string }[]>([
    { id: 'p-1', left: 'Vế trái 1', right: 'Vế phải 1' },
    { id: 'p-2', left: 'Vế trái 2', right: 'Vế phải 2' },
  ]);
  const [formOrderingItems, setFormOrderingItems] = useState<string[]>([
    'Bước 1',
    'Bước 2',
    'Bước 3',
  ]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questionBank.filter(q => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(kw);
        const matchesCode = q.code?.toLowerCase().includes(kw);
        const matchesTopic = q.topic?.toLowerCase().includes(kw);
        const matchesTags = q.tags?.some(t => t.toLowerCase().includes(kw));
        if (!matchesQ && !matchesCode && !matchesTopic && !matchesTags) return false;
      }
      if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) return false;
      if (selectedGrade !== 'ALL' && q.gradeLevel?.toString() !== selectedGrade) return false;
      if (selectedType === 'ALL_MCQ') {
        const mcqTypes: QuestionType[] = [
          'SINGLE',
          'MULTIPLE',
          'TRUE_FALSE',
          'MATCHING',
          'ORDERING',
          'FILL_BLANK',
          'PASSAGE_BASED',
        ];
        if (!mcqTypes.includes(q.type)) return false;
      } else if (selectedType !== 'ALL' && q.type !== selectedType) {
        return false;
      }
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [
    questionBank,
    searchKeyword,
    selectedSubject,
    selectedGrade,
    selectedType,
    selectedDifficulty,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const total = questionBank.length;
    const byType: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const bySubject: Record<string, number> = {};

    const mcqTypes: QuestionType[] = [
      'SINGLE',
      'MULTIPLE',
      'TRUE_FALSE',
      'MATCHING',
      'ORDERING',
      'FILL_BLANK',
      'PASSAGE_BASED',
    ];

    let mcqCount = 0;

    questionBank.forEach(q => {
      byType[q.type] = (byType[q.type] || 0) + 1;
      if (mcqTypes.includes(q.type)) mcqCount++;
      if (q.difficulty) byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
      if (q.subject) bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });

    return { total, mcqCount, byType, byDifficulty, bySubject };
  }, [questionBank]);

  // Selection handlers
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const toggleExplanation = (id: string) => {
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- AI GENERATION ACTION ---
  const handleStartAiGeneration = async () => {
    if (!aiTopic.trim() && !aiLessonContent.trim()) {
      showToast('warning', 'Vui lòng nhập chủ đề bài học hoặc tải lên ngữ liệu bài giảng!');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const questions = await AiService.generateQuestionBankQuestions({
        topic: aiTopic || 'Kiến thức bài học',
        lessonContent: aiLessonContent,
        subject: aiSubject,
        gradeLevel: aiGrade,
        count: aiCount,
        difficulties: aiDifficulties,
        questionTypes: aiTypes,
      });

      if (questions && questions.length > 0) {
        setAiGeneratedProposals(questions);
        setApprovedProposalIds(new Set(questions.map(q => q.id)));
        setAiStep('review');
        showToast('success', `AI đã đề xuất thành công ${questions.length} câu hỏi theo chuẩn GDPT!`);
      } else {
        showToast('error', 'Không thể khởi tạo câu hỏi. Vui lòng thử lại với chủ đề khác.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Có lỗi xảy ra trong quá trình gọi AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save Approved Proposals to Bank
  const handleSaveApprovedToBank = () => {
    const toSave = aiGeneratedProposals.filter(q => approvedProposalIds.has(q.id));
    if (toSave.length === 0) {
      showToast('warning', 'Vui lòng chọn ít nhất 1 câu hỏi để duyệt và lưu vào Ngân hàng!');
      return;
    }

    importQuestionBankItems(toSave);
    setIsAiModalOpen(false);
    setAiStep('input');
    setAiGeneratedProposals([]);
    showToast('success', `Đã lưu thành công ${toSave.length} câu hỏi mới vào Ngân hàng!`);
  };

  // Create Quick Quiz from Selected Questions
  const handleCreateQuizFromSelected = (questionsList: QuizQuestion[]) => {
    if (questionsList.length === 0) {
      showToast('warning', 'Chưa có câu hỏi nào được chọn để tạo đề kiểm tra!');
      return;
    }

    const first = questionsList[0];
    const quizTitle = `Đề kiểm tra nhanh: ${first.topic || first.subject} (${questionsList.length} câu)`;
    const newQuiz = {
      title: quizTitle,
      classId: selectedClass?.id || 'cls-9a1',
      className: selectedClass?.name || 'Lớp 9A1',
      subject: first.subject || 'Toán học',
      durationMinutes: Math.max(15, questionsList.length * 2),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      shuffleQuestions: true,
      shuffleOptions: true,
      questions: questionsList,
      totalPoints: Number(questionsList.reduce((sum, q) => sum + (q.points || 1), 0).toFixed(1)),
      isPublished: true,
    };

    addQuiz(newQuiz);
    showToast('success', `Đã tạo đề kiểm tra trực tuyến: "${quizTitle}"!`);
  };

  // --- EXCEL IMPORT PARSER & VALIDATOR ---
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        if (!data || data.length < 2) {
          showToast('error', 'File Excel trống hoặc không có dòng dữ liệu hợp lệ!');
          return;
        }

        // Row 0 is header. Rows 1..N are data
        const currentBankQuestions = questionBank.map(q => q.question.trim().toLowerCase());
        const currentBankCodes = new Set(
          questionBank.map(q => q.code?.trim().toUpperCase()).filter(Boolean)
        );
        const seenInFileQuestions = new Set<string>();

        const parsedRows: typeof parsedImportRows = [];

        for (let r = 1; r < data.length; r++) {
          const row = data[r];
          if (!row || row.length === 0 || !row[6]) continue; // Column 6 is usually question content

          const code = (row[0] || `EXCEL-${Date.now().toString(36)}-${r}`).toString().trim();
          const subject = (row[1] || 'Toán học').toString().trim();
          const gradeLevel = parseInt(row[2]) || 9;
          const topic = (row[3] || 'Chủ đề chung').toString().trim();
          const rawType = (row[4] || 'SINGLE').toString().trim().toUpperCase();
          const rawDiff = (row[5] || 'THONG_HIEU').toString().trim().toUpperCase();
          const questionText = (row[6] || '').toString().trim();
          const passage = row[7] ? row[7].toString().trim() : undefined;
          const optA = row[8] ? row[8].toString().trim() : '';
          const optB = row[9] ? row[9].toString().trim() : '';
          const optC = row[10] ? row[10].toString().trim() : '';
          const optD = row[11] ? row[11].toString().trim() : '';
          const rawAnswer = (row[12] || '').toString().trim();
          const explanation = row[13] ? row[13].toString().trim() : '';
          const points = parseFloat(row[14]) || 1.0;

          const errors: string[] = [];
          if (!questionText) errors.push('Thiếu nội dung câu hỏi (Cột G)');

          // Validate Type
          let type: QuestionType = 'SINGLE';
          if (rawType in QUESTION_TYPE_CONFIG) {
            type = rawType as QuestionType;
          }

          // Validate Difficulty
          let difficulty: DifficultyLevel = 'THONG_HIEU';
          if (rawDiff in DIFFICULTY_CONFIG) {
            difficulty = rawDiff as DifficultyLevel;
          }

          // Options check
          const options = [optA, optB, optC, optD].filter(Boolean);
          if (type === 'SINGLE' || type === 'MULTIPLE') {
            if (options.length < 2) {
              errors.push('Dạng trắc nghiệm cần tối thiểu 2 phương án (Cột I, J)');
            }
            if (!rawAnswer) {
              errors.push('Thiếu đáp án đúng (Cột M)');
            }
          }

          // Check duplicate
          const qNorm = questionText.toLowerCase();
          let isDuplicate = false;
          let duplicateReason: string | undefined = undefined;

          if (currentBankQuestions.includes(qNorm)) {
            isDuplicate = true;
            duplicateReason = 'Trùng nội dung với câu hỏi đã có sẵn trong Ngân hàng';
          } else if (code && currentBankCodes.has(code.toUpperCase())) {
            isDuplicate = true;
            duplicateReason = `Trùng mã câu hỏi "${code}" đã có trong hệ thống`;
          } else if (seenInFileQuestions.has(qNorm)) {
            isDuplicate = true;
            duplicateReason = 'Trùng lặp với một câu hỏi khác trong cùng file Excel này';
          }

          seenInFileQuestions.add(qNorm);

          const constructedQuestion: QuizQuestion = {
            id: `import-${Date.now()}-${r}`,
            code,
            subject,
            gradeLevel,
            topic,
            type,
            difficulty,
            question: questionText,
            passage,
            options: options.length > 0 ? options : undefined,
            correctAnswer: rawAnswer,
            explanation,
            points,
            createdAt: new Date().toISOString(),
          };

          parsedRows.push({
            rowNumber: r + 1,
            question: constructedQuestion,
            isValid: errors.length === 0,
            errors,
            isDuplicate,
            duplicateReason,
          });
        }

        setParsedImportRows(parsedRows);
        showToast('info', `Đã quét file Excel: ${parsedRows.length} dòng câu hỏi được nhận diện.`);
      } catch (err) {
        console.error(err);
        showToast('error', 'Định dạng file Excel không hợp lệ hoặc bị lỗi đọc.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'Mã câu hỏi (Code)',
      'Môn học (Subject)',
      'Khối lớp (Grade: 6-12)',
      'Chủ đề (Topic)',
      'Dạng câu (SINGLE|MULTIPLE|TRUE_FALSE|MATCHING|ORDERING|FILL_BLANK|SHORT_ANSWER|ESSAY|PASSAGE_BASED)',
      'Mức độ (NHAN_BIET|THONG_HIEU|VAN_DUNG|VAN_DUNG_CAO)',
      'Nội dung câu hỏi (Question Content)',
      'Ngữ liệu/Đoạn văn nếu có (Passage)',
      'Phương án A (Option A)',
      'Phương án B (Option B)',
      'Phương án C (Option C)',
      'Phương án D (Option D)',
      'Đáp án đúng (Correct Answer)',
      'Lời giải chi tiết (Explanation)',
      'Điểm số (Points)',
    ];

    const sampleRow1 = [
      'TOAN9-M01',
      'Toán học',
      9,
      'Căn bậc hai',
      'SINGLE',
      'NHAN_BIET',
      'Biểu thức √(x - 5) có nghĩa khi nào?',
      '',
      'x ≥ 5',
      'x > 5',
      'x ≤ 5',
      'x < 5',
      'x ≥ 5',
      'Biểu thức dưới căn xác định khi x - 5 ≥ 0 <=> x ≥ 5.',
      1.0,
    ];

    const sampleRow2 = [
      'ENG9-M02',
      'Tiếng Anh',
      9,
      'Environment',
      'PASSAGE_BASED',
      'THONG_HIEU',
      'What is the primary cause of ocean pollution mentioned in the text?',
      'Oceans are increasingly polluted by single-use plastics and untreated industrial waste dumping from coastal factories.',
      'Single-use plastics and waste dumping',
      'Solar radiation',
      'Commercial fishing boats',
      'Natural seaweed growth',
      'Single-use plastics and waste dumping',
      'Directly stated in the first sentence of the passage.',
      1.5,
    ];

    const sampleRow3 = [
      'KHTN9-M03',
      'Khoa học tự nhiên (Vật lý)',
      9,
      'Thấu kính hội tụ',
      'SHORT_ANSWER',
      'VAN_DUNG',
      'Một thấu kính hội tụ có tiêu cự f = 20 cm. Vật đặt cách kính d = 40 cm. Khoảng cách từ ảnh đến kính là bao nhiêu cm?',
      '',
      '',
      '',
      '',
      '',
      '40',
      'Áp dụng công thức 1/f = 1/d + 1/d\' => 1/20 = 1/40 + 1/d\' => d\' = 40 cm.',
      2.0,
    ];

    const wsData = [headers, sampleRow1, sampleRow2, sampleRow3];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 22 },
      { wch: 10 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 45 },
      { wch: 35 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 40 },
      { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Ngan_Hang_Cau_Hoi');
    XLSX.writeFile(wb, 'Mau_Import_Ngan_Hang_Cau_Hoi_EduSmart.xlsx');
    showToast('success', 'Đã tải xuống file Excel mẫu chuẩn hóa!');
  };

  // Submit Excel Import
  const handleConfirmExcelImport = () => {
    let toImport = parsedImportRows
      .filter(r => r.isValid)
      .filter(r => (skipDuplicates ? !r.isDuplicate : true))
      .map(r => r.question);

    if (toImport.length === 0) {
      showToast('warning', 'Không có câu hỏi hợp lệ nào để import (hoặc tất cả đều bị trùng lặp).');
      return;
    }

    importQuestionBankItems(toImport);
    setIsImportModalOpen(false);
    setParsedImportRows([]);
    setExcelFile(null);
    showToast('success', `Đã import thành công ${toImport.length} câu hỏi vào Ngân hàng!`);
  };

  // --- BATCH TEXT ADD PARSER ---
  const handleBatchTextAdd = () => {
    if (!batchRawText.trim()) {
      showToast('warning', 'Vui lòng dán văn bản danh sách câu hỏi!');
      return;
    }

    // Split questions by "[Câu " or "Câu " or numbers
    const rawQuestions = batchRawText.split(/(?=\[?\s*Câu\s+\d+[:\]\.])/i).filter(Boolean);
    const parsed: QuizQuestion[] = [];

    rawQuestions.forEach((chunk, idx) => {
      const lines = chunk
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      let questionContent = '';
      const options: string[] = [];
      let correctAnswer = '';
      let explanation = '';

      for (const line of lines) {
        if (/^\[?\s*Câu\s+\d+[:\]\.]/i.test(line)) {
          questionContent = line.replace(/^\[?\s*Câu\s+\d+[:\]\.]/i, '').trim();
        } else if (/^[A-D][\.\)]/i.test(line)) {
          options.push(line.replace(/^[A-D][\.\)]\s*/i, '').trim());
        } else if (/^(Đáp án|Đáp án đúng|ĐA)[:\-]/i.test(line)) {
          const ansKey = line.replace(/^(Đáp án|Đáp án đúng|ĐA)[:\-]\s*/i, '').trim();
          if (/^[A-D]$/i.test(ansKey)) {
            const letterIdx = ansKey.toUpperCase().charCodeAt(0) - 65;
            correctAnswer = options[letterIdx] || ansKey;
          } else {
            correctAnswer = ansKey;
          }
        } else if (/^(Lời giải|Hướng dẫn giải|Giải thích)[:\-]/i.test(line)) {
          explanation = line.replace(/^(Lời giải|Hướng dẫn giải|Giải thích)[:\-]\s*/i, '').trim();
        } else if (!questionContent) {
          questionContent += ' ' + line;
        } else if (options.length === 0 && !correctAnswer) {
          questionContent += ' ' + line;
        } else if (explanation) {
          explanation += ' ' + line;
        }
      }

      if (questionContent) {
        parsed.push({
          id: `batch-${Date.now()}-${idx}`,
          code: `BATCH-${Date.now().toString(36).slice(-4)}-${idx + 1}`,
          subject: batchSubject,
          gradeLevel: batchGrade,
          topic: batchTopic,
          type: options.length > 0 ? 'SINGLE' : 'SHORT_ANSWER',
          difficulty: 'THONG_HIEU',
          question: questionContent,
          options: options.length > 0 ? options : undefined,
          correctAnswer: correctAnswer || options[0] || 'Chưa cập nhật',
          explanation: explanation || 'Theo kiến thức trọng tâm bài học.',
          points: 1.0,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (parsed.length === 0) {
      showToast('error', 'Không thể bóc tách câu hỏi từ văn bản này. Vui lòng kiểm tra định dạng.');
      return;
    }

    importQuestionBankItems(parsed);
    setIsBatchAddModalOpen(false);
    showToast('success', `Đã bóc tách và thêm nhanh ${parsed.length} câu hỏi vào Ngân hàng!`);
  };

  // --- EXPORT TO EXCEL ---
  const handleExportToExcel = (questionsToExport: QuizQuestion[]) => {
    if (questionsToExport.length === 0) {
      showToast('warning', 'Không có câu hỏi nào để xuất!');
      return;
    }

    const headers = [
      'STT',
      'Mã câu hỏi',
      'Môn học',
      'Khối',
      'Chủ đề',
      'Dạng câu hỏi',
      'Mức độ nhận thức',
      'Nội dung câu hỏi',
      'Ngữ liệu/Đoạn văn',
      'Phương án A',
      'Phương án B',
      'Phương án C',
      'Phương án D',
      'Đáp án đúng',
      'Lời giải chi tiết',
      'Điểm số',
    ];

    const rows = questionsToExport.map((q, idx) => [
      idx + 1,
      q.code || '',
      q.subject || '',
      q.gradeLevel || '',
      q.topic || '',
      QUESTION_TYPE_CONFIG[q.type]?.label || q.type,
      DIFFICULTY_CONFIG[q.difficulty || 'THONG_HIEU']?.label || q.difficulty,
      q.question,
      q.passage || '',
      q.options?.[0] || '',
      q.options?.[1] || '',
      q.options?.[2] || '',
      q.options?.[3] || '',
      typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer,
      q.explanation || '',
      q.points || 1.0,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NganHangCauHoi');
    XLSX.writeFile(
      wb,
      `EduSmart_Ngan_Hang_Cau_Hoi_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('success', `Đã xuất ${questionsToExport.length} câu hỏi ra file Excel!`);
    setIsExportModalOpen(false);
  };

  // --- EXPORT TO WORD (.DOC) ---
  const handleExportToWord = (questionsToExport: QuizQuestion[], includeAnswers: boolean = true) => {
    if (questionsToExport.length === 0) {
      showToast('warning', 'Không có câu hỏi nào để xuất!');
      return;
    }

    let docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Ngân hàng câu hỏi - EduSmart</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; }
          .header-table { width: 100%; margin-bottom: 25px; border-collapse: collapse; }
          .header-table td { vertical-align: top; font-size: 12pt; }
          .title { text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 20px 0 10px; }
          .subtitle { text-align: center; font-size: 12pt; font-style: italic; margin-bottom: 25px; }
          .question-item { margin-bottom: 18px; page-break-inside: avoid; }
          .q-title { font-weight: bold; margin-bottom: 6px; }
          .options-grid { margin-left: 20px; margin-bottom: 6px; }
          .opt { margin-bottom: 4px; }
          .passage { background: #f3f4f6; border-left: 3px solid #4b5563; padding: 10px; margin-bottom: 10px; font-style: italic; }
          .ans-box { background: #eff6ff; border: 1px dashed #3b82f6; padding: 8px 12px; margin-top: 6px; font-size: 11pt; }
          .ans-sheet { margin-top: 40px; page-break-before: always; }
          .ans-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .ans-table th, .ans-table td { border: 1px solid #333; padding: 6px 10px; font-size: 11pt; text-align: left; }
          .ans-table th { background: #e5e7eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <strong>SỞ GD&ĐT / TRƯỜNG THCS & THPT</strong><br>
              <strong>HỆ THỐNG QUẢN LÝ EDUSMART</strong><br>
              ------------------------
            </td>
            <td style="width: 50%; text-align: center;">
              <strong>NGÂN HÀNG CÂU HỎI CHUẨN HÓA</strong><br>
              Năm học 2025 - 2026<br>
              Số lượng: ${questionsToExport.length} câu hỏi
            </td>
          </tr>
        </table>

        <div class="title">BỘ CÂU HỎI KHẢO THÍ & ĐÁNH GIÁ</div>
        <div class="subtitle">Trích xuất tự động từ Ngân hàng câu hỏi số EduSmart</div>

        <div class="questions-container">
    `;

    questionsToExport.forEach((q, idx) => {
      const typeCfg = QUESTION_TYPE_CONFIG[q.type];
      const diffCfg = DIFFICULTY_CONFIG[q.difficulty || 'THONG_HIEU'];

      docHtml += `
        <div class="question-item">
          <div class="q-title">
            Câu ${idx + 1} [${q.code || `ID-${idx + 1}`}] (${diffCfg.label} - ${typeCfg.shortLabel} - ${q.points || 1} điểm):
          </div>
      `;

      if (q.passage) {
        docHtml += `<div class="passage"><strong>Đoạn văn / Ngữ liệu:</strong><br>${q.passage}</div>`;
      }

      docHtml += `<div>${q.question}</div>`;

      // Options
      if (q.options && q.options.length > 0) {
        docHtml += `<div class="options-grid">`;
        q.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          docHtml += `<div class="opt"><strong>${letter}.</strong> ${opt}</div>`;
        });
        docHtml += `</div>`;
      }

      // True/False Subquestions
      if (q.subQuestions && q.subQuestions.length > 0) {
        docHtml += `<div class="options-grid">`;
        q.subQuestions.forEach(sq => {
          docHtml += `<div class="opt">□ ${sq.text}</div>`;
        });
        docHtml += `</div>`;
      }

      // Matching Pairs
      if (q.pairs && q.pairs.length > 0) {
        docHtml += `<table style="width: 100%; border-collapse: collapse; margin: 8px 0;">`;
        docHtml += `<tr><th style="border: 1px solid #ccc; padding: 4px;">Cột A</th><th style="border: 1px solid #ccc; padding: 4px;">Cột B</th></tr>`;
        q.pairs.forEach(p => {
          docHtml += `<tr><td style="border: 1px solid #ccc; padding: 4px;">${p.left}</td><td style="border: 1px solid #ccc; padding: 4px;">${p.right}</td></tr>`;
        });
        docHtml += `</table>`;
      }

      // In-line Answers if enabled
      if (includeAnswers) {
        docHtml += `
          <div class="ans-box">
            <strong>Đáp án:</strong> ${typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer}<br>
            ${q.explanation ? `<strong>Lời giải:</strong> <em>${q.explanation}</em>` : ''}
          </div>
        `;
      }

      docHtml += `</div>`;
    });

    // Answer key summary at end
    if (includeAnswers) {
      docHtml += `
        <div class="ans-sheet">
          <div class="title" style="font-size: 14pt;">BẢNG ĐÁP ÁN & LỜI GIẢI CHI TIẾT TỔNG HỢP</div>
          <table class="ans-table">
            <thead>
              <tr>
                <th style="width: 8%;">Câu</th>
                <th style="width: 15%;">Mã câu</th>
                <th style="width: 17%;">Mức độ</th>
                <th style="width: 25%;">Đáp án đúng</th>
                <th style="width: 35%;">Lời giải tóm tắt</th>
              </tr>
            </thead>
            <tbody>
      `;

      questionsToExport.forEach((q, idx) => {
        docHtml += `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>${q.code || '-'}</td>
            <td>${DIFFICULTY_CONFIG[q.difficulty || 'THONG_HIEU']?.label || '-'}</td>
            <td><strong>${typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer}</strong></td>
            <td>${q.explanation || '-'}</td>
          </tr>
        `;
      });

      docHtml += `
            </tbody>
          </table>
        </div>
      `;
    }

    docHtml += `
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `De_Ngan_Hang_Cau_Hoi_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', `Đã xuất ${questionsToExport.length} câu hỏi ra file Word (.doc) thành công!`);
    setIsExportModalOpen(false);
  };

  // --- PRINT / PDF VIEW ---
  const handlePrintPdf = (questionsToExport: QuizQuestion[]) => {
    if (questionsToExport.length === 0) {
      showToast('warning', 'Không có câu hỏi nào để in!');
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('error', 'Trình duyệt chặn mở cửa sổ in. Vui lòng cho phép popup.');
      return;
    }

    printWin.document.write(`
      <html>
        <head>
          <title>In Ngân Hàng Câu Hỏi - EduSmart</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #111; line-height: 1.5; }
            h2 { text-align: center; margin-bottom: 5px; }
            .meta { text-align: center; font-size: 13px; color: #555; margin-bottom: 25px; }
            .item { margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #ddd; }
            .q-header { font-weight: bold; font-size: 15px; margin-bottom: 6px; }
            .opt { margin-left: 20px; margin-bottom: 4px; font-size: 14px; }
            .ans { margin-top: 6px; font-size: 13px; color: #0284c7; font-weight: 600; }
            .exp { font-size: 12px; color: #666; font-style: italic; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>NGÂN HÀNG CÂU HỎI CHUẨN HÓA EDUSMART</h2>
          <div class="meta">Tổng số: ${questionsToExport.length} câu hỏi • Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
          ${questionsToExport
            .map(
              (q, idx) => `
            <div class="item">
              <div class="q-header">Câu ${idx + 1} [${q.code || ''}]: ${q.question}</div>
              ${q.passage ? `<div style="background:#f5f5f5; padding:8px; font-style:italic; margin-bottom:6px;">${q.passage}</div>` : ''}
              ${
                q.options
                  ? q.options
                      .map((opt, i) => `<div class="opt">${String.fromCharCode(65 + i)}. ${opt}</div>`)
                      .join('')
                  : ''
              }
              <div class="ans">Đáp án: ${typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer}</div>
              ${q.explanation ? `<div class="exp">Lời giải: ${q.explanation}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 500);
    setIsExportModalOpen(false);
  };

  // --- SINGLE QUESTION CREATE / EDIT SUBMIT ---
  const handleSaveSingleQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      showToast('warning', 'Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const payload: Omit<QuizQuestion, 'id'> = {
      code: formCode.trim() || `QB-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      question: formQuestion.trim(),
      subject: formSubject,
      gradeLevel: formGrade,
      topic: formTopic.trim() || 'Chủ đề trọng tâm',
      type: formType,
      difficulty: formDifficulty,
      passage: formPassage.trim() || undefined,
      options:
        formType === 'SINGLE' || formType === 'MULTIPLE' || formType === 'PASSAGE_BASED'
          ? formOptions.filter(Boolean)
          : undefined,
      subQuestions: formType === 'TRUE_FALSE' ? formSubQuestions : undefined,
      pairs: formType === 'MATCHING' ? formPairs : undefined,
      orderingItems: formType === 'ORDERING' ? formOrderingItems : undefined,
      correctAnswer: formCorrectAnswer,
      explanation: formExplanation.trim() || undefined,
      points: formPoints || 1.0,
      createdAt: new Date().toISOString(),
    };

    if (editingQuestion) {
      updateQuestionBankItem(editingQuestion.id, payload);
      setEditingQuestion(null);
    } else {
      addQuestionBankItem(payload);
    }

    setIsCreateSingleModalOpen(false);
    resetSingleForm();
  };

  const resetSingleForm = () => {
    setFormCode('');
    setFormQuestion('');
    setFormSubject('Toán học');
    setFormGrade(9);
    setFormTopic('');
    setFormType('SINGLE');
    setFormDifficulty('NHAN_BIET');
    setFormPassage('');
    setFormOptions(['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']);
    setFormCorrectAnswer('Phương án A');
    setFormExplanation('');
    setFormPoints(1.0);
  };

  const handleOpenEdit = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormCode(q.code || '');
    setFormQuestion(q.question);
    setFormSubject(q.subject || 'Toán học');
    setFormGrade(q.gradeLevel || 9);
    setFormTopic(q.topic || '');
    setFormType(q.type);
    setFormDifficulty(q.difficulty || 'THONG_HIEU');
    setFormPassage(q.passage || '');
    setFormOptions(q.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']);
    setFormCorrectAnswer(q.correctAnswer || '');
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 1.0);
    if (q.subQuestions) setFormSubQuestions(q.subQuestions);
    if (q.pairs) setFormPairs(q.pairs);
    if (q.orderingItems) setFormOrderingItems(q.orderingItems);
    setIsCreateSingleModalOpen(true);
  };

  // Duplicate a Question
  const handleDuplicateQuestion = (q: QuizQuestion) => {
    const copy: Omit<QuizQuestion, 'id'> = {
      ...q,
      code: `${q.code || 'QB'}-COPY`,
      question: `${q.question} (Bản sao)`,
      createdAt: new Date().toISOString(),
    };
    addQuestionBankItem(copy);
    showToast('success', 'Đã sao chép câu hỏi thành công!');
  };

  // Delete Handlers
  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    deleteQuestionBankItem(questionToDelete);
    setQuestionToDelete(null);
  };

  const handleDeleteSelected = () => {
    if (!isDeleteEnabled) {
      showToast('warning', 'Chức năng xóa đang bị TẮT! Vui lòng bật chế độ xóa ở thanh điều khiển.');
      return;
    }
    if (selectedQuestionIds.size === 0) return;

    selectedQuestionIds.forEach(id => {
      deleteQuestionBankItem(id);
    });
    setSelectedQuestionIds(new Set());
    showToast('info', 'Đã xóa các câu hỏi đã chọn khỏi Ngân hàng.');
  };

  // Prompt template string for Gemini
  const GEMINI_SYSTEM_PROMPT = `BẠN LÀ CHUYÊN GIA KHẢO THÍ SƯ PHẠM CAO CẤP - BỘ GD&ĐT VIỆT NAM (CHUẨN GDPT 2018 & ĐỊNH HƯỚNG BỘ ĐỀ 2025).

NHIỆM VỤ:
Soạn thảo bộ câu hỏi trắc nghiệm & tự luận đa dạng cho Ngân hàng câu hỏi thông minh, với đầy đủ:
1. Mã câu hỏi chuẩn hóa (Code)
2. Môn học & Khối lớp (Lớp 6 đến Lớp 12)
3. Chủ đề trọng tâm & Chuẩn kiến thức kỹ năng
4. Phân tầng 4 mức độ nhận thức:
   - Nhận biết (Recognition)
   - Thông hiểu (Comprehension)
   - Vận dụng (Application)
   - Vận dụng cao (High-level synthesis)
5. Hỗ trợ đầy đủ 9 dạng câu hỏi hiện đại:
   - SINGLE: Trắc nghiệm 1 đáp án đúng (A, B, C, D)
   - MULTIPLE: Trắc nghiệm chọn nhiều đáp án đúng
   - TRUE_FALSE: Đúng/Sai theo từng ý a, b, c, d (Định dạng đề thi tốt nghiệp mới của Bộ GD&ĐT)
   - MATCHING: Ghép đôi Cột A với Cột B
   - ORDERING: Sắp xếp các bước quy trình, thí nghiệm hoặc dòng sự kiện
   - FILL_BLANK: Điền khuyết từ ngữ hoặc công thức vào chỗ trống
   - SHORT_ANSWER: Điền kết quả số hoặc câu trả lời ngắn
   - ESSAY: Đề tự luận kèm barem điểm chi tiết
   - PASSAGE_BASED: Đọc hiểu đoạn văn/tình huống thực tế kèm câu hỏi con
6. Đáp án đúng chính xác 100%
7. Lời giải chi tiết từng bước (Step-by-step rationale)
8. Điểm số tương ứng theo ma trận đề thi

ĐỊNH DẠNG TRẢ VỀ: JSON array chuẩn xác để import trực tiếp vào hệ thống EduSmart:
[
  {
    "code": "TOAN9-01",
    "subject": "Toán học",
    "gradeLevel": 9,
    "topic": "Căn bậc hai và Hằng đẳng thức",
    "type": "SINGLE",
    "difficulty": "NHAN_BIET",
    "question": "Nội dung câu hỏi...",
    "passage": "Đoạn văn ngữ liệu nếu có...",
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctAnswer": "Phương án A",
    "explanation": "Giải thích chi tiết vì sao...",
    "points": 1.0
  }
]`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Bright Text and Luminous Accents */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#071933]/90 border border-[#11315e] p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Ngân Hàng Câu Hỏi Thông Minh
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  AI GDPT 2018
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Quản lý, phân loại 9 dạng câu hỏi, AI tạo tự động, import Excel/Word kiểm tra trùng lặp và xuất đa định dạng
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setAiStep('input');
              setIsAiModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>AI Đề Xuất Câu Hỏi</span>
          </button>

          <button
            onClick={() => setIsBatchAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0b2447] hover:bg-[#11315e] text-cyan-300 border border-cyan-800/60 font-bold text-xs transition-all"
            title="Dán văn bản thô nhiều câu trắc nghiệm cùng lúc"
          >
            <ListPlus className="w-4 h-4 text-cyan-400" />
            <span>Thêm Nhanh Nhiều Câu</span>
          </button>

          <button
            onClick={() => {
              setParsedImportRows([]);
              setExcelFile(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0b2447] hover:bg-[#11315e] text-emerald-300 border border-emerald-800/60 font-bold text-xs transition-all"
            title="Import từ Excel hoặc Word có kiểm tra trùng lặp"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel / Word</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0b2447] hover:bg-[#11315e] text-amber-300 border border-amber-800/60 font-bold text-xs transition-all"
            title="Xuất sang Word, Excel hoặc in PDF"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Xuất File</span>
          </button>

          <button
            onClick={() => setIsPromptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 font-bold text-xs transition-all"
            title="Sao chép Prompt chuẩn sư phạm đưa vào Gemini"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Prompt Gemini</span>
          </button>

          <button
            onClick={() => {
              resetSingleForm();
              setEditingQuestion(null);
              setIsCreateSingleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Mới</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedType('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedType === 'ALL'
              ? 'bg-[#0b2447] border-blue-400 ring-1 ring-blue-400'
              : 'bg-[#071933] border-[#11315e] hover:border-slate-500'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Tổng câu hỏi</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Trong ngân hàng</div>
        </div>

        <div
          onClick={() => setSelectedType(selectedType === 'ALL_MCQ' ? 'ALL' : 'ALL_MCQ')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedType === 'ALL_MCQ'
              ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-[#071933] border-cyan-800/60 hover:border-cyan-400'
          }`}
        >
          <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
            <span>⚡ Trắc nghiệm</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200">
              {selectedType === 'ALL_MCQ' ? 'Đang lọc' : 'Lọc'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">{stats.mcqCount}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">
            {stats.total > 0 ? Math.round((stats.mcqCount / stats.total) * 100) : 0}% ngân hàng
          </div>
        </div>

        <div
          onClick={() => setSelectedDifficulty(selectedDifficulty === 'NHAN_BIET' ? 'ALL' : 'NHAN_BIET')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDifficulty === 'NHAN_BIET'
              ? 'bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-400'
              : 'bg-[#071933] border-[#11315e] hover:border-emerald-600/60'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Nhận biết</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
            {stats.byDifficulty['NHAN_BIET'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cơ bản trọng tâm</div>
        </div>

        <div
          onClick={() => setSelectedDifficulty(selectedDifficulty === 'THONG_HIEU' ? 'ALL' : 'THONG_HIEU')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDifficulty === 'THONG_HIEU'
              ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400'
              : 'bg-[#071933] border-[#11315e] hover:border-cyan-600/60'
          }`}
        >
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Thông hiểu</div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
            {stats.byDifficulty['THONG_HIEU'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Hiểu bản chất</div>
        </div>

        <div
          onClick={() => setSelectedDifficulty(selectedDifficulty === 'VAN_DUNG' ? 'ALL' : 'VAN_DUNG')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDifficulty === 'VAN_DUNG'
              ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400'
              : 'bg-[#071933] border-[#11315e] hover:border-amber-600/60'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Vận dụng</div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
            {stats.byDifficulty['VAN_DUNG'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Giải bài toán</div>
        </div>

        <div
          onClick={() => setSelectedDifficulty(selectedDifficulty === 'VAN_DUNG_CAO' ? 'ALL' : 'VAN_DUNG_CAO')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDifficulty === 'VAN_DUNG_CAO'
              ? 'bg-rose-950/80 border-rose-400 ring-1 ring-rose-400'
              : 'bg-[#071933] border-[#11315e] hover:border-rose-600/60'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Vận dụng cao</div>
          <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1">
            {stats.byDifficulty['VAN_DUNG_CAO'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Phân hóa & HSG</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#071933] border border-[#11315e] p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm theo nội dung câu hỏi, mã code, chủ đề, từ khóa..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tất cả môn học</option>
            {SUBJECT_LIST.map(sub => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="px-3 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tất cả khối lớp</option>
            {[6, 7, 8, 9, 10, 11, 12].map(g => (
              <option key={g} value={g.toString()}>
                Khối {g}
              </option>
            ))}
          </select>

          {/* Question Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tất cả dạng câu hỏi</option>
            <option value="ALL_MCQ">⚡ Tất cả trắc nghiệm ({stats.mcqCount} câu)</option>
            {Object.entries(QUESTION_TYPE_CONFIG).map(([k, cfg]) => (
              <option key={k} value={k}>
                {cfg.label} ({stats.byType[k] || 0})
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tất cả mức độ</option>
            {Object.entries(DIFFICULTY_CONFIG).map(([k, cfg]) => (
              <option key={k} value={k}>
                {cfg.label} ({stats.byDifficulty[k] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Pills Row for Trắc Nghiệm & Question Types */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Lọc nhanh:</span>
          
          <button
            type="button"
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              selectedType === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-[#030d1c] text-slate-300 hover:text-white border border-[#133766]'
            }`}
          >
            Tất cả ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('ALL_MCQ')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'ALL_MCQ'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400'
                : 'bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-800/60'
            }`}
          >
            <span>⚡ Tất cả trắc nghiệm</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/80 text-[10px] text-cyan-200">
              {stats.mcqCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('SINGLE')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'SINGLE'
                ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
                : 'bg-[#030d1c] text-sky-300 hover:text-white border border-sky-800/60'
            }`}
          >
            <span>TN 1 đáp án (A,B,C,D)</span>
            <span className="text-[10px] opacity-80">({stats.byType['SINGLE'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('MULTIPLE')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'MULTIPLE'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'bg-[#030d1c] text-indigo-300 hover:text-white border border-indigo-800/60'
            }`}
          >
            <span>Nhiều đáp án</span>
            <span className="text-[10px] opacity-80">({stats.byType['MULTIPLE'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('TRUE_FALSE')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'TRUE_FALSE'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-[#030d1c] text-amber-300 hover:text-white border border-amber-800/60'
            }`}
          >
            <span>Đúng/Sai từng ý</span>
            <span className="text-[10px] opacity-80">({stats.byType['TRUE_FALSE'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('MATCHING')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'MATCHING'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-[#030d1c] text-teal-300 hover:text-white border border-teal-800/60'
            }`}
          >
            <span>Ghép đôi</span>
            <span className="text-[10px] opacity-80">({stats.byType['MATCHING'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('ORDERING')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'ORDERING'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[#030d1c] text-cyan-300 hover:text-white border border-cyan-800/60'
            }`}
          >
            <span>Sắp xếp</span>
            <span className="text-[10px] opacity-80">({stats.byType['ORDERING'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('FILL_BLANK')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'FILL_BLANK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#030d1c] text-emerald-300 hover:text-white border border-emerald-800/60'
            }`}
          >
            <span>Điền khuyết</span>
            <span className="text-[10px] opacity-80">({stats.byType['FILL_BLANK'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('SHORT_ANSWER')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'SHORT_ANSWER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#030d1c] text-blue-300 hover:text-white border border-blue-800/60'
            }`}
          >
            <span>Trả lời ngắn</span>
            <span className="text-[10px] opacity-80">({stats.byType['SHORT_ANSWER'] || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('ESSAY')}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedType === 'ESSAY'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-[#030d1c] text-rose-300 hover:text-white border border-rose-800/60'
            }`}
          >
            <span>Tự luận</span>
            <span className="text-[10px] opacity-80">({stats.byType['ESSAY'] || 0})</span>
          </button>
        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedQuestionIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#11315e] bg-[#041329] px-3.5 py-2.5 rounded-xl">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Đang chọn {selectedQuestionIds.size} câu hỏi</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const selectedQuestions = questionBank.filter(q => selectedQuestionIds.has(q.id));
                  handleCreateQuizFromSelected(selectedQuestions);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tạo Đề Thi Ngay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const selectedQuestions = questionBank.filter(q => selectedQuestionIds.has(q.id));
                  handleExportToWord(selectedQuestions, true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b2447] hover:bg-[#11315e] text-blue-300 border border-blue-700/60 font-bold text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xuất Word</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const selectedQuestions = questionBank.filter(q => selectedQuestionIds.has(q.id));
                  handleExportToExcel(selectedQuestions);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b2447] hover:bg-[#11315e] text-emerald-300 border border-emerald-700/60 font-bold text-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa câu đã chọn</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedQuestionIds(new Set())}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Hủy chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main List of Questions */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 font-bold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  filteredQuestions.length > 0 &&
                  selectedQuestionIds.size === filteredQuestions.length
                }
                onChange={toggleSelectAll}
                className="rounded border-slate-700 text-blue-500 focus:ring-blue-400 w-4 h-4 bg-[#030d1c]"
              />
              <span>Chọn tất cả ({filteredQuestions.length} câu)</span>
            </label>
          </div>

          <div className="text-slate-400 font-medium">
            Hiển thị <strong>{filteredQuestions.length}</strong> / {questionBank.length} câu
          </div>
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-[#071933] border border-[#11315e] p-12 text-center rounded-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chưa tìm thấy câu hỏi phù hợp</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                Hãy thử nới lỏng bộ lọc hoặc bấm nút <strong>"AI Đề Xuất Câu Hỏi"</strong> để Gemini
                tạo ngay bộ câu hỏi chuẩn môn học và khối lớp!
              </p>
            </div>
            <button
              onClick={() => {
                setAiStep('input');
                setIsAiModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Tạo câu hỏi với AI ngay
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const typeConfig = QUESTION_TYPE_CONFIG[q.type] || QUESTION_TYPE_CONFIG.SINGLE;
            const diffConfig =
              DIFFICULTY_CONFIG[q.difficulty || 'THONG_HIEU'] || DIFFICULTY_CONFIG.THONG_HIEU;
            const isSelected = selectedQuestionIds.has(q.id);
            const isExpOpen = expandedExplanations.has(q.id);

            return (
              <div
                key={q.id}
                className={`bg-[#071933] border transition-all rounded-2xl p-5 space-y-4 relative ${
                  isSelected
                    ? 'border-cyan-400/90 shadow-md shadow-cyan-500/10'
                    : 'border-[#11315e] hover:border-[#1d4c8a]'
                }`}
              >
                {/* Header row: Checkbox, Code, Badges, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectQuestion(q.id)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4 bg-[#030d1c]"
                    />

                    <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded-lg">
                      {q.code || `QB-${idx + 1}`}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeConfig.bgColor} ${typeConfig.color} ${typeConfig.borderColor}`}
                    >
                      {typeConfig.shortLabel}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${diffConfig.bg} ${diffConfig.color} ${diffConfig.border}`}
                    >
                      {diffConfig.label}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-300">
                      {q.subject} {q.gradeLevel ? `• Khối ${q.gradeLevel}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-300 mr-2">
                      {q.points || 1.0} điểm
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-[#0b2447] transition-colors"
                      title="Sao chép câu hỏi này"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-blue-300 hover:bg-[#0b2447] transition-colors"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionToDelete(q.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-[#0b2447] transition-colors"
                      title="Xóa câu hỏi khỏi ngân hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Passage / Reading Context if any */}
                {q.passage && (
                  <div className="p-3.5 rounded-xl bg-[#041329] border border-[#11315e] text-xs text-slate-200 space-y-1">
                    <div className="font-bold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Đoạn văn / Ngữ liệu tình huống:</span>
                    </div>
                    <p className="italic leading-relaxed text-slate-200">{q.passage}</p>
                  </div>
                )}

                {/* Question Text */}
                <div className="text-sm font-bold text-white leading-relaxed">
                  <span className="text-cyan-400 mr-1.5">Câu {idx + 1}:</span>
                  {q.question}
                </div>

                {/* Render Question Content by Type */}

                {/* 1. SINGLE & MULTIPLE */}
                {(q.type === 'SINGLE' || q.type === 'MULTIPLE') && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.includes(opt) || q.correctAnswer.includes(letter)
                        : q.correctAnswer === opt || q.correctAnswer === letter;

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 font-bold'
                              : 'bg-[#030d1c] border-[#133766] text-slate-200 font-medium'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-[#0c2850] text-slate-300'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. TRUE_FALSE by statements (a, b, c, d) */}
                {q.type === 'TRUE_FALSE' && q.subQuestions && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-amber-300 mb-1">
                      Xét tính Đúng / Sai của từng mệnh đề sau:
                    </div>
                    {q.subQuestions.map(sq => (
                      <div
                        key={sq.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#030d1c] border border-[#133766] text-xs text-slate-200"
                      >
                        <span className="font-medium flex-1 pr-4">{sq.text}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              sq.correctAnswer
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {sq.correctAnswer ? 'ĐÚNG ✓' : 'SAI ✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. MATCHING (Pairs) */}
                {q.type === 'MATCHING' && q.pairs && (
                  <div className="pt-1 space-y-2">
                    <div className="text-xs font-bold text-teal-300 mb-1">Cặp ghép đôi chuẩn:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.pairs.map((p, pIdx) => (
                        <div
                          key={p.id || pIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#030d1c] border border-[#133766] text-xs text-slate-200"
                        >
                          <span className="font-bold text-cyan-300">{p.left}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-2" />
                          <span className="text-emerald-300 font-medium">{p.right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ORDERING */}
                {q.type === 'ORDERING' && q.orderingItems && (
                  <div className="pt-1 space-y-1.5">
                    <div className="text-xs font-bold text-cyan-300 mb-1">
                      Thứ tự chuẩn cần sắp xếp:
                    </div>
                    {q.orderingItems.map((item, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#030d1c] border border-[#133766] text-xs text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                          {oIdx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. FILL_BLANK & SHORT_ANSWER */}
                {(q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER') && (
                  <div className="pt-1 p-3 rounded-xl bg-[#030d1c] border border-[#133766] text-xs text-slate-200 flex items-center gap-3">
                    <span className="font-bold text-slate-400">Đáp án chuẩn:</span>
                    <span className="font-black text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/80">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {/* 6. ESSAY */}
                {q.type === 'ESSAY' && (
                  <div className="pt-1 p-3.5 rounded-xl bg-[#030d1c] border border-[#133766] text-xs text-slate-200 space-y-2">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Hướng dẫn chấm & Barem tự luận:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {q.correctAnswer || 'Yêu cầu lập luận chặt chẽ, đầy đủ các ý chính.'}
                    </p>
                  </div>
                )}

                {/* Explanation Toggle & Content */}
                <div className="pt-2 border-t border-[#11315e]/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(q.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isExpOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isExpOpen ? 'Ẩn lời giải chi tiết' : 'Xem lời giải & hướng dẫn chấm'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {q.topic && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Chủ đề: <strong className="text-slate-200">{q.topic}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpOpen && q.explanation && (
                    <div className="p-3.5 rounded-xl bg-[#041329] border border-cyan-800/40 text-xs text-slate-200 space-y-1">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Lời giải chi tiết:</span>
                      </div>
                      <p className="leading-relaxed text-slate-300 whitespace-pre-line">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL 1: AI QUESTION GENERATION WITH REVIEW --- */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        maxWidth="3xl"
        title="AI Đề Xuất Bộ Câu Hỏi Chuẩn Giáo Dục (GDPT 2018)"
      >
        {aiStep === 'input' ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white mb-0.5">
                  Quy trình Sư phạm thông minh (Human-in-the-loop):
                </strong>
                Giáo viên nhập chủ đề hoặc tải giáo án → AI đề xuất bộ câu hỏi kèm đáp án & mức độ →
                Thầy/Cô duyệt và chỉnh sửa trực tiếp trước khi lưu vào ngân hàng.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Môn học *</label>
                <select
                  value={aiSubject}
                  onChange={e => setAiSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                >
                  {SUBJECT_LIST.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Khối lớp *</label>
                <select
                  value={aiGrade}
                  onChange={e => setAiGrade(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>
                      Lớp {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Chủ đề hoặc Tên bài học trọng tâm *
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="VD: Định lý Pytago; Hiện tượng phản xạ ánh sáng; Thì quá khứ đơn; Kiều ở lầu Ngưng Bích..."
                className="w-full px-3.5 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Hoặc Dán / Tải lên nội dung bài học, ngữ liệu bài giảng (Tùy chọn)
              </label>
              <textarea
                rows={4}
                value={aiLessonContent}
                onChange={e => setAiLessonContent(e.target.value)}
                placeholder="Dán toàn bộ đoạn văn, bài đọc hoặc nội dung lý thuyết bài học để AI trích xuất câu hỏi bám sát ngữ liệu..."
                className="w-full px-3.5 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">Số lượng câu hỏi</label>
                <div className="flex items-center gap-2">
                  {[3, 5, 8, 10].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setAiCount(cnt)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-colors ${
                        aiCount === cnt
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-[#030d1c] text-slate-300 border-[#133766] hover:bg-[#071933]'
                      }`}
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1.5">Phân bổ mức độ</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['NHAN_BIET', 'THONG_HIEU', 'VAN_DUNG', 'VAN_DUNG_CAO'] as DifficultyLevel[]).map(
                    lvl => {
                      const isChecked = aiDifficulties.includes(lvl);
                      return (
                        <label
                          key={lvl}
                          className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) setAiDifficulties(aiDifficulties.filter(d => d !== lvl));
                              else setAiDifficulties([...aiDifficulties, lvl]);
                            }}
                            className="rounded border-slate-700 text-cyan-500 w-3.5 h-3.5"
                          />
                          <span>{DIFFICULTY_CONFIG[lvl].label}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Các dạng câu hỏi mong muốn:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    'SINGLE',
                    'MULTIPLE',
                    'TRUE_FALSE',
                    'MATCHING',
                    'ORDERING',
                    'FILL_BLANK',
                    'SHORT_ANSWER',
                    'ESSAY',
                    'PASSAGE_BASED',
                  ] as QuestionType[]
                ).map(t => {
                  const isChecked = aiTypes.includes(t);
                  return (
                    <label
                      key={t}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#0c2850] border-cyan-500/80 text-white font-bold'
                          : 'bg-[#030d1c] border-[#133766] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) setAiTypes(aiTypes.filter(x => x !== t));
                          else setAiTypes([...aiTypes, t]);
                        }}
                        className="rounded border-slate-700 text-cyan-500 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] truncate">
                        {QUESTION_TYPE_CONFIG[t]?.shortLabel || t}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#11315e] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleStartAiGeneration}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang phân tích và tạo câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tạo Đề Xuất Câu Hỏi Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Teacher Review Proposals */
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#041329] border border-cyan-800/60">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Duyệt Bộ Câu Hỏi AI Đề Xuất ({approvedProposalIds.size} /{' '}
                  {aiGeneratedProposals.length} câu được chọn)
                </h4>
                <p className="text-[11px] text-slate-300">
                  Thầy/Cô hãy kiểm tra nội dung, lời giải và tích chọn các câu đạt yêu cầu để lưu
                  vào Ngân hàng.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiStep('input')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Tạo lại
                </button>
              </div>
            </div>

            {/* List of Proposals */}
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {aiGeneratedProposals.map((item, idx) => {
                const isApproved = approvedProposalIds.has(item.id);
                const typeCfg = QUESTION_TYPE_CONFIG[item.type] || QUESTION_TYPE_CONFIG.SINGLE;
                const diffCfg =
                  DIFFICULTY_CONFIG[item.difficulty || 'THONG_HIEU'] ||
                  DIFFICULTY_CONFIG.THONG_HIEU;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      isApproved
                        ? 'bg-[#071933] border-cyan-500/80'
                        : 'bg-[#030d1c]/80 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2.5 font-bold cursor-pointer text-white">
                        <input
                          type="checkbox"
                          checked={isApproved}
                          onChange={() => {
                            setApprovedProposalIds(prev => {
                              const next = new Set(prev);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            });
                          }}
                          className="rounded border-slate-700 text-cyan-500 w-4 h-4"
                        />
                        <span className="text-cyan-300">Câu {idx + 1}:</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${typeCfg.bgColor} ${typeCfg.color} ${typeCfg.borderColor}`}
                        >
                          {typeCfg.shortLabel}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${diffCfg.bg} ${diffCfg.color} ${diffCfg.border}`}
                        >
                          {diffCfg.label}
                        </span>
                      </label>

                      <span className="font-bold text-amber-300">{item.points || 1.0}đ</span>
                    </div>

                    <div className="font-medium text-slate-100">{item.question}</div>

                    {item.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-[11px] ${
                              opt === item.correctAnswer ||
                              (Array.isArray(item.correctAnswer) &&
                                item.correctAnswer.includes(opt))
                                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                                : 'bg-[#030d1c] border-[#133766] text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-[#041329] border border-[#11315e] text-[11px] space-y-1">
                      <div className="text-emerald-300 font-bold">
                        Đáp án đúng:{' '}
                        {typeof item.correctAnswer === 'object'
                          ? JSON.stringify(item.correctAnswer)
                          : item.correctAnswer}
                      </div>
                      {item.explanation && (
                        <div className="text-slate-300 italic">Lời giải: {item.explanation}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#11315e] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Đã duyệt{' '}
                <strong className="text-white">{approvedProposalIds.size} câu hỏi</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveApprovedToBank}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Vào Ngân Hàng ({approvedProposalIds.size} câu)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 2: IMPORT EXCEL / WORD WITH VALIDATION & DUPLICATE DETECTION --- */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        maxWidth="3xl"
        title="Import Câu Hỏi Từ Excel / Word (Kiểm tra cú pháp & Trùng lặp)"
      >
        <div className="space-y-4 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#11315e] pb-2">
            <button
              type="button"
              onClick={() => setImportTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                importTab === 'excel'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Từ File Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => setImportTab('word')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                importTab === 'word'
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Dán Văn Bản Từ Word</span>
            </button>
          </div>

          {importTab === 'excel' ? (
            <div className="space-y-4">
              {/* Template Download Notice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#041329] border border-[#11315e]">
                <div>
                  <h4 className="font-bold text-white">Chưa có file Excel mẫu chuẩn?</h4>
                  <p className="text-[11px] text-slate-300">
                    Tải file mẫu có sẵn các cột chuẩn, hướng dẫn chi tiết và ví dụ mẫu 9 dạng câu
                    hỏi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 font-bold shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File Mẫu (.xlsx)</span>
                </button>
              </div>

              {/* Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#133766] hover:border-cyan-400 p-8 rounded-2xl text-center bg-[#030d1c] cursor-pointer transition-colors space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">
                  {excelFile ? excelFile.name : 'Nhấp để chọn file Excel hoặc kéo thả vào đây'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng .xlsx, .xls (Tối đa 1000 câu hỏi mỗi lượt)
                </p>
              </div>

              {/* Validation Results if file parsed */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#071933] border border-[#11315e]">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">
                        Đã đọc: {parsedImportRows.length} dòng
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Hợp lệ: {parsedImportRows.filter(r => r.isValid && !r.isDuplicate).length}
                      </span>
                      <span className="text-amber-400 font-bold">
                        Trùng lặp: {parsedImportRows.filter(r => r.isDuplicate).length}
                      </span>
                      <span className="text-rose-400 font-bold">
                        Lỗi cú pháp: {parsedImportRows.filter(r => !r.isValid).length}
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={e => setSkipDuplicates(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 w-4 h-4"
                      />
                      <span>Tự động bỏ qua câu hỏi trùng lặp</span>
                    </label>
                  </div>

                  {/* Rows Preview Table */}
                  <div className="max-h-60 overflow-y-auto border border-[#11315e] rounded-xl bg-[#030d1c]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#11315e] bg-[#071933] text-slate-300 text-[11px]">
                          <th className="p-2.5">Dòng</th>
                          <th className="p-2.5">Trạng thái</th>
                          <th className="p-2.5">Mã & Môn</th>
                          <th className="p-2.5">Nội dung câu hỏi</th>
                          <th className="p-2.5">Đáp án</th>
                          <th className="p-2.5">Ghi chú kiểm tra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#11315e] text-[11px]">
                        {parsedImportRows.map(row => (
                          <tr
                            key={row.rowNumber}
                            className={`hover:bg-[#071933]/50 ${
                              !row.isValid
                                ? 'bg-rose-950/20'
                                : row.isDuplicate
                                ? 'bg-amber-950/20'
                                : ''
                            }`}
                          >
                            <td className="p-2.5 font-bold text-slate-400">#{row.rowNumber}</td>
                            <td className="p-2.5">
                              {!row.isValid ? (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                  Lỗi cú pháp
                                </span>
                              ) : row.isDuplicate ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  Trùng lặp
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                  Hợp lệ
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-300 font-medium">
                              <div>{row.question.code}</div>
                              <div className="text-[10px] text-slate-400">
                                {row.question.subject}
                              </div>
                            </td>
                            <td className="p-2.5 font-bold text-white max-w-xs truncate">
                              {row.question.question}
                            </td>
                            <td className="p-2.5 text-emerald-300 font-bold">
                              {typeof row.question.correctAnswer === 'object'
                                ? JSON.stringify(row.question.correctAnswer)
                                : row.question.correctAnswer}
                            </td>
                            <td className="p-2.5 text-slate-400">
                              {row.errors.length > 0 ? (
                                <span className="text-rose-400">{row.errors.join('; ')}</span>
                              ) : row.duplicateReason ? (
                                <span className="text-amber-400">{row.duplicateReason}</span>
                              ) : (
                                <span className="text-emerald-400">Sẵn sàng import</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#11315e] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={parsedImportRows.length === 0}
                  onClick={handleConfirmExcelImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  Xác Nhận Import Vào Ngân Hàng
                </button>
              </div>
            </div>
          ) : (
            /* Word Import Tab */
            <div className="space-y-3">
              <p className="text-slate-300">
                Dán trực tiếp văn bản từ tài liệu Word của Thầy/Cô. Hệ thống hỗ trợ định dạng chuẩn:
                <br />
                <code className="text-cyan-300 font-mono text-[11px]">
                  [Câu 1] Nội dung câu hỏi... A. ... B. ... C. ... D. ... Đáp án: B Lời giải: ...
                </code>
              </p>
              <textarea
                rows={10}
                value={wordImportText}
                onChange={e => setWordImportText(e.target.value)}
                placeholder="Dán nội dung Word tại đây..."
                className="w-full px-3.5 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBatchRawText(wordImportText);
                    setIsImportModalOpen(false);
                    setIsBatchAddModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Tiếp tục bóc tách câu hỏi
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* --- MODAL 3: BATCH ADD MULTIPLE QUESTIONS --- */}
      <Modal
        isOpen={isBatchAddModalOpen}
        onClose={() => setIsBatchAddModalOpen(false)}
        maxWidth="2xl"
        title="Thêm Nhanh Hàng Loạt Câu Hỏi Trắc Nghiệm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#041329] border border-[#11315e] text-slate-300">
            Dán văn bản thô theo cấu trúc <strong className="text-cyan-400">[Câu X]</strong> hoặc{' '}
            <strong className="text-cyan-400">Câu X:</strong>, các phương án A, B, C, D, và dòng
            Đáp án / Lời giải. Parser sẽ tự động bóc tách thành các câu hỏi riêng biệt.
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">Môn học</label>
              <select
                value={batchSubject}
                onChange={e => setBatchSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              >
                {SUBJECT_LIST.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-200 mb-1">Khối lớp</label>
              <select
                value={batchGrade}
                onChange={e => setBatchGrade(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              >
                {[6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-200 mb-1">Chủ đề chung</label>
              <input
                type="text"
                value={batchTopic}
                onChange={e => setBatchTopic(e.target.value)}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1">
              Văn bản danh sách câu hỏi:
            </label>
            <textarea
              rows={12}
              value={batchRawText}
              onChange={e => setBatchRawText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 border-t border-[#11315e] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsBatchAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleBatchTextAdd}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Bóc Tách & Thêm Vào Ngân Hàng
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 4: EXPORT MODAL --- */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        maxWidth="md"
        title="Xuất Ngân Hàng Câu Hỏi & Đề Thi"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Chọn định dạng xuất dữ liệu cho{' '}
            <strong className="text-white">
              {selectedQuestionIds.size > 0
                ? `${selectedQuestionIds.size} câu hỏi đang chọn`
                : `${filteredQuestions.length} câu hỏi theo bộ lọc hiện tại`}
            </strong>
            :
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                const target =
                  selectedQuestionIds.size > 0
                    ? questionBank.filter(q => selectedQuestionIds.has(q.id))
                    : filteredQuestions;
                handleExportToWord(target, true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#030d1c] border border-blue-800/80 hover:bg-[#071933] text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-bold text-white">Xuất File Word (.doc) Kèm Đáp Án</div>
                  <div className="text-[11px] text-slate-400">
                    Bản giáo viên: Đầy đủ ma trận, đề bài, đáp án và lời giải chi tiết
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-blue-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                const target =
                  selectedQuestionIds.size > 0
                    ? questionBank.filter(q => selectedQuestionIds.has(q.id))
                    : filteredQuestions;
                handleExportToWord(target, false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#030d1c] border border-sky-800/80 hover:bg-[#071933] text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="font-bold text-white">Xuất File Word (.doc) Không Đáp Án</div>
                  <div className="text-[11px] text-slate-400">
                    Bản phát cho học sinh làm bài trên lớp hoặc thi thử
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-sky-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                const target =
                  selectedQuestionIds.size > 0
                    ? questionBank.filter(q => selectedQuestionIds.has(q.id))
                    : filteredQuestions;
                handleExportToExcel(target);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#030d1c] border border-emerald-800/80 hover:bg-[#071933] text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Xuất File Excel Chuẩn (.xlsx)</div>
                  <div className="text-[11px] text-slate-400">
                    Lưu trữ ngân hàng dữ liệu số hoặc import vào các hệ thống khác
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                const target =
                  selectedQuestionIds.size > 0
                    ? questionBank.filter(q => selectedQuestionIds.has(q.id))
                    : filteredQuestions;
                handlePrintPdf(target);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#030d1c] border border-purple-800/80 hover:bg-[#071933] text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-bold text-white">In Trực Tiếp / Xuất PDF</div>
                  <div className="text-[11px] text-slate-400">
                    Mở hộp thoại in trình duyệt chuẩn trang A4 sắc nét
                  </div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 5: GEMINI PROMPT TEMPLATE MODAL --- */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        maxWidth="2xl"
        title="Prompt Chuẩn Sư Phạm Đưa Vào Gemini"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#041329] border border-indigo-800/60 text-slate-300">
            Dưới đây là Prompt kỹ thuật chuyên gia tối ưu cho Gemini để tạo câu hỏi đúng chuẩn GDPT
            2018 (hỗ trợ cả 9 dạng câu hỏi và 4 mức độ nhận thức). Thầy/Cô có thể sao chép để đưa
            vào Gemini:
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={14}
              value={GEMINI_SYSTEM_PROMPT}
              className="w-full p-3 bg-[#030d1c] border border-[#133766] rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-400 text-[11px]">Chuẩn cấu trúc JSON EduSmart</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(GEMINI_SYSTEM_PROMPT);
                showToast('success', 'Đã sao chép Prompt chuẩn vào Clipboard!');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Copy className="w-4 h-4" />
              <span>Sao Chép Prompt</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 6: CREATE / EDIT SINGLE QUESTION MODAL --- */}
      <Modal
        isOpen={isCreateSingleModalOpen}
        onClose={() => {
          setIsCreateSingleModalOpen(false);
          setEditingQuestion(null);
        }}
        maxWidth="2xl"
        title={editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới Vào Ngân Hàng'}
      >
        <form onSubmit={handleSaveSingleQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">Mã câu hỏi (Code)</label>
              <input
                type="text"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                placeholder="VD: TOAN9-001"
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-200 mb-1">Môn học *</label>
              <select
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              >
                {SUBJECT_LIST.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-200 mb-1">Khối lớp *</label>
              <select
                value={formGrade}
                onChange={e => setFormGrade(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              >
                {[6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">Dạng câu hỏi *</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium"
              >
                {Object.entries(QUESTION_TYPE_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Mức độ nhận thức *</label>
              <select
                value={formDifficulty}
                onChange={e => setFormDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium"
              >
                {Object.entries(DIFFICULTY_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1">Chủ đề bài học</label>
            <input
              type="text"
              value={formTopic}
              onChange={e => setFormTopic(e.target.value)}
              placeholder="VD: Định lý Vi-ét, Khúc xạ ánh sáng..."
              className="w-full px-3.5 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
            />
          </div>

          {formType === 'PASSAGE_BASED' && (
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Đoạn văn / Ngữ liệu tình huống *
              </label>
              <textarea
                rows={3}
                value={formPassage}
                onChange={e => setFormPassage(e.target.value)}
                placeholder="Nhập đoạn văn trích dẫn..."
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-200 mb-1">Nội dung câu hỏi *</label>
            <textarea
              rows={3}
              required
              value={formQuestion}
              onChange={e => setFormQuestion(e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full px-3.5 py-2.5 bg-[#030d1c] border border-[#133766] rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Options for SINGLE / MULTIPLE / PASSAGE_BASED */}
          {(formType === 'SINGLE' || formType === 'MULTIPLE' || formType === 'PASSAGE_BASED') && (
            <div className="space-y-2">
              <label className="block font-bold text-slate-200">Các phương án lựa chọn:</label>
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 font-bold text-cyan-400">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => {
                      const updated = [...formOptions];
                      updated[idx] = e.target.value;
                      setFormOptions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#030d1c] border border-[#133766] rounded-lg text-white"
                  />
                  <input
                    type={formType === 'SINGLE' ? 'radio' : 'checkbox'}
                    name="correct-opt"
                    checked={
                      formType === 'SINGLE'
                        ? formCorrectAnswer === opt
                        : Array.isArray(formCorrectAnswer) && formCorrectAnswer.includes(opt)
                    }
                    onChange={() => {
                      if (formType === 'SINGLE') {
                        setFormCorrectAnswer(opt);
                      } else {
                        const cur = Array.isArray(formCorrectAnswer) ? formCorrectAnswer : [];
                        if (cur.includes(opt))
                          setFormCorrectAnswer(cur.filter((x: string) => x !== opt));
                        else setFormCorrectAnswer([...cur, opt]);
                      }
                    }}
                    title="Đánh dấu đáp án đúng"
                    className="w-4 h-4 text-emerald-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Answer for Short Answer or Essay */}
          {(formType === 'SHORT_ANSWER' || formType === 'FILL_BLANK' || formType === 'ESSAY') && (
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                {formType === 'ESSAY' ? 'Barem điểm / Hướng dẫn chấm tự luận' : 'Đáp án đúng *'}
              </label>
              <textarea
                rows={2}
                value={formCorrectAnswer}
                onChange={e => setFormCorrectAnswer(e.target.value)}
                placeholder="Nhập đáp án chuẩn..."
                className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white font-medium"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-200 mb-1">Lời giải chi tiết</label>
            <textarea
              rows={2}
              value={formExplanation}
              onChange={e => setFormExplanation(e.target.value)}
              placeholder="Giải thích từng bước, dẫn chứng hoặc công thức áp dụng..."
              className="w-full px-3 py-2 bg-[#030d1c] border border-[#133766] rounded-xl text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-200">Điểm số:</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={formPoints}
                onChange={e => setFormPoints(parseFloat(e.target.value))}
                className="w-20 px-2 py-1 bg-[#030d1c] border border-[#133766] rounded-lg text-white font-bold"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateSingleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {editingQuestion ? 'Cập Nhật Câu Hỏi' : 'Lưu Vào Ngân Hàng'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={confirmDeleteQuestion}
        title="Xác nhận xóa câu hỏi"
        message="Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng? Hành động này sẽ không thể hoàn tác."
        confirmLabel="Xóa câu hỏi"
        isDestructive={true}
      />
    </div>
  );
};
