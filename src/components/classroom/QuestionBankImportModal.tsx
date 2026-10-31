import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { QuizQuestion, QuestionType, DifficultyLevel } from '../../types';
import { useApp } from '../../contexts/AppContext';
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Copy,
  Info,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface QuestionBankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

interface ParsedQuestionRow {
  rowIndex: number;
  rawCode?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  subject: string;
  gradeLevel: number;
  topic?: string;
  passage?: string;
  question: string;
  options?: string[];
  subQuestions?: { id: string; text: string; correctAnswer: boolean }[];
  correctAnswer: any;
  explanation?: string;
  points: number;
  errors: string[];
  duplicateWithId?: string;
  duplicateScore?: number;
  isDuplicate: boolean;
  isValid: boolean;
}

// Compute simple similarity between two normalized strings
function computeSimilarity(s1: string, s2: string): number {
  const norm1 = s1.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const norm2 = s2.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
  }
  // Bigram Jaccard similarity
  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.slice(i, i + 2));
    }
    return bigrams;
  };
  const b1 = getBigrams(norm1);
  const b2 = getBigrams(norm2);
  let intersection = 0;
  b1.forEach(b => {
    if (b2.has(b)) intersection++;
  });
  const union = b1.size + b2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export const QuestionBankImportModal: React.FC<QuestionBankImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { questionBank, importQuestionBankItems, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'excel' | 'word'>('excel');
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'errors' | 'duplicates'>('all');
  const [excludeDuplicates, setExcludeDuplicates] = useState(true);
  const [wordText, setWordText] = useState('');
  const [defaultSubject, setDefaultSubject] = useState('Toán học');
  const [defaultGrade, setDefaultGrade] = useState(9);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset when modal opens
  const handleReset = () => {
    setParsedRows([]);
    setWordText('');
    setFilterMode('all');
  };

  // Download Sample Excel Template
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'Mã câu': 'TOAN9-01',
        'Môn học': 'Toán học',
        'Khối': 9,
        'Chủ đề': 'Căn bậc hai',
        'Dạng câu hỏi': 'Trắc nghiệm', // SINGLE
        'Mức độ': 'Nhận biết', // NHAN_BIET
        'Đoạn văn / Tình huống': '',
        'Nội dung câu hỏi': 'Điều kiện xác định của biểu thức √(4x - 8) là gì?',
        'Phương án A': 'x ≥ 2',
        'Phương án B': 'x > 2',
        'Phương án C': 'x ≤ 2',
        'Phương án D': 'x < 2',
        'Đáp án đúng': 'A',
        'Lời giải chi tiết': '4x - 8 ≥ 0 ⇔ 4x ≥ 8 ⇔ x ≥ 2.',
        'Điểm số': 1.0,
      },
      {
        'Mã câu': 'TOAN9-02',
        'Môn học': 'Toán học',
        'Khối': 9,
        'Chủ đề': 'Tính chất căn bậc hai',
        'Dạng câu hỏi': 'Nhiều đáp án', // MULTIPLE
        'Mức độ': 'Thông hiểu', // THONG_HIEU
        'Đoạn văn / Tình huống': '',
        'Nội dung câu hỏi': 'Trong các khẳng định sau, khẳng định nào ĐÚNG với a, b ≥ 0?',
        'Phương án A': '√(a · b) = √a · √b',
        'Phương án B': '√(a + b) = √a + √b',
        'Phương án C': '√(a / b) = √a / √b (b > 0)',
        'Phương án D': '√(a^2) = a',
        'Đáp án đúng': 'A, C, D',
        'Lời giải chi tiết': 'Căn của tổng không bằng tổng hai căn.',
        'Điểm số': 1.5,
      },
      {
        'Mã câu': 'TOAN9-03',
        'Môn học': 'Toán học',
        'Khối': 9,
        'Chủ đề': 'Hệ thức lượng',
        'Dạng câu hỏi': 'Trả lời ngắn', // SHORT_ANSWER
        'Mức độ': 'Vận dụng', // VAN_DUNG
        'Đoạn văn / Tình huống': '',
        'Nội dung câu hỏi': 'Cho tam giác ABC vuông tại A, đường cao AH. Biết BH = 4, CH = 9. Tính độ dài AH:',
        'Phương án A': '',
        'Phương án B': '',
        'Phương án C': '',
        'Phương án D': '',
        'Đáp án đúng': '6',
        'Lời giải chi tiết': 'AH^2 = BH · CH = 36 ⇒ AH = 6.',
        'Điểm số': 1.0,
      },
      {
        'Mã câu': 'TOAN9-04',
        'Môn học': 'Toán học',
        'Khối': 9,
        'Chủ đề': 'Rút gọn căn',
        'Dạng câu hỏi': 'Đúng sai', // TRUE_FALSE
        'Mức độ': 'Vận dụng',
        'Đoạn văn / Tình huống': '',
        'Nội dung câu hỏi': 'Cho biểu thức P = √x / (√x - 1). Xét tính đúng/sai của các ý sau:',
        'Phương án A': 'a) x = 4 thì P = 2 [Đúng]',
        'Phương án B': 'b) ĐKXĐ là x ≥ 0 và x ≠ 1 [Đúng]',
        'Phương án C': 'c) P luôn dương với mọi x trong ĐKXĐ [Sai]',
        'Phương án D': 'd) Có vô số nghiệm nguyên của P [Sai]',
        'Đáp án đúng': 'Đ, Đ, S, S',
        'Lời giải chi tiết': 'Ý a đúng, ý b đúng, ý c sai vì x=0 thì P=0, ý d sai.',
        'Điểm số': 2.0,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 6 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 14 },
      { wch: 35 },
      { wch: 8 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_CauHoi_Chuan');
    XLSX.writeFile(wb, 'Mau_Import_NganHangCauHoi_EduSmart.xlsx');
    showToast('success', 'Đã tải xuống file mẫu Excel chuẩn!');
  };

  // Download Sample Word / Text Template
  const downloadSampleWord = () => {
    const textContent = `MẪU SOẠN THẢO CÂU HỎI CHUẨN HÓA (WORD / TEXT)
==============================================
Cú pháp chuẩn hóa để hệ thống tự động bóc tách:
- Mỗi câu bắt đầu bằng "Câu [Số]:" hoặc "Câu [Số] [Mức độ]:"
- Mức độ: [NB] (Nhận biết), [TH] (Thông hiểu), [VD] (Vận dụng), [VDC] (Vận dụng cao)
- Các phương án trắc nghiệm: A. / B. / C. / D.
- Dòng đáp án: "Đáp án: [A hoặc A, B hoặc từ cần điền]"
- Dòng lời giải: "Lời giải: [Nội dung giải thích chi tiết]"

--- VÍ DỤ MẪU BÊN DƯỚI (Bạn có thể copy paste trực tiếp): ---

Câu 1 [NB] [Trắc nghiệm]: Điều kiện xác định của biểu thức √(5x - 15) là gì?
A. x ≥ 3
B. x > 3
C. x ≤ 3
D. x < 3
Đáp án: A
Lời giải: 5x - 15 ≥ 0 ⇔ 5x ≥ 15 ⇔ x ≥ 3.

Câu 2 [TH] [Nhiều đáp án]: Những hằng đẳng thức nào sau đây là ĐÚNG với mọi a, b ≥ 0?
A. √(a · b) = √a · √b
B. √(a + b) = √a + √b
C. √(a / b) = √a / √b (b > 0)
D. √(a^2) = a
Đáp án: A, C, D
Lời giải: Căn của một tổng không bằng tổng các căn.

Câu 3 [VD] [Đúng sai]: Cho biểu thức P = √x / (√x - 2). Xét tính đúng/sai:
A. a) Điều kiện xác định là x ≥ 0 và x ≠ 4
B. b) Khi x = 9 thì P = 3
C. c) Giá trị của P luôn lớn hơn 0
D. d) P không nhận giá trị âm
Đáp án: Đ, Đ, S, S
Lời giải: Với x = 1 thì P = 1/(1-2) = -1 < 0.

Câu 4 [TH] [Điền khuyết]: Điền từ còn thiếu vào chỗ trống: Hai đường thẳng song song là hai đường thẳng không có _____ chung.
Đáp án: điểm
Lời giải: Định nghĩa hai đường thẳng song song trong hình học phẳng.
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Import_CauHoi_Word_Text.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Đã tải xuống file hướng dẫn chuẩn Word / Text!');
  };

  // Helper to parse Difficulty string
  const parseDifficulty = (val: string): DifficultyLevel => {
    const s = String(val || '').toLowerCase().trim();
    if (s.includes('nhận biết') || s.includes('nb') || s.includes('nhan biet')) return 'NHAN_BIET';
    if (s.includes('vận dụng cao') || s.includes('vdc') || s.includes('van dung cao')) return 'VAN_DUNG_CAO';
    if (s.includes('vận dụng') || s.includes('vd') || s.includes('van dung')) return 'VAN_DUNG';
    return 'THONG_HIEU'; // Mặc định
  };

  // Helper to parse Question Type string
  const parseType = (val: string): QuestionType => {
    const s = String(val || '').toLowerCase().trim();
    if (s.includes('nhiều đáp án') || s.includes('multiple')) return 'MULTIPLE';
    if (s.includes('đúng sai') || s.includes('true') || s.includes('đúng/sai')) return 'TRUE_FALSE';
    if (s.includes('ghép đôi') || s.includes('matching')) return 'MATCHING';
    if (s.includes('sắp xếp') || s.includes('ordering')) return 'ORDERING';
    if (s.includes('điền khuyết') || s.includes('fill') || s.includes('chỗ trống')) return 'FILL_BLANK';
    if (s.includes('trả lời ngắn') || s.includes('short')) return 'SHORT_ANSWER';
    if (s.includes('tự luận') || s.includes('essay')) return 'ESSAY';
    if (s.includes('đoạn văn') || s.includes('tình huống') || s.includes('passage')) return 'PASSAGE_BASED';
    return 'SINGLE';
  };

  // Parse Excel File
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = evt => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          showToast('error', 'File Excel không có dữ liệu!');
          setIsProcessing(false);
          return;
        }

        const rows: ParsedQuestionRow[] = [];

        jsonData.forEach((row, idx) => {
          const rowIndex = idx + 2; // Excel row number (1-based header is row 1)
          const errors: string[] = [];

          // Find question content
          const questionText = String(
            row['Nội dung câu hỏi'] || row['Câu hỏi'] || row['Nội dung'] || row['question'] || ''
          ).trim();

          if (!questionText) {
            errors.push('Thiếu nội dung câu hỏi (Cột "Nội dung câu hỏi")');
          }

          const rawType = String(row['Dạng câu hỏi'] || row['Loại'] || row['type'] || 'Trắc nghiệm');
          const type = parseType(rawType);
          const difficulty = parseDifficulty(String(row['Mức độ'] || row['difficulty'] || 'TH'));
          const subject = String(row['Môn học'] || defaultSubject).trim();
          const gradeLevel = Number(row['Khối'] || defaultGrade) || 9;
          const topic = String(row['Chủ đề'] || '').trim();
          const rawCode = String(row['Mã câu'] || `IMP-${rowIndex}`).trim();
          const passage = String(row['Đoạn văn / Tình huống'] || row['Đoạn văn'] || '').trim();
          const explanation = String(row['Lời giải chi tiết'] || row['Lời giải'] || '').trim();
          const points = Number(row['Điểm số'] || 1.0) || 1.0;

          // Options A, B, C, D
          const optA = String(row['Phương án A'] || row['A'] || '').trim();
          const optB = String(row['Phương án B'] || row['B'] || '').trim();
          const optC = String(row['Phương án C'] || row['C'] || '').trim();
          const optD = String(row['Phương án D'] || row['D'] || '').trim();

          const options: string[] = [];
          if (optA) options.push(optA);
          if (optB) options.push(optB);
          if (optC) options.push(optC);
          if (optD) options.push(optD);

          const rawAnswer = String(row['Đáp án đúng'] || row['Đáp án'] || row['correctAnswer'] || '').trim();

          if (!rawAnswer && type !== 'ESSAY') {
            errors.push('Thiếu đáp án đúng (Cột "Đáp án đúng")');
          }

          if ((type === 'SINGLE' || type === 'MULTIPLE') && options.length < 2) {
            errors.push('Câu hỏi trắc nghiệm cần ít nhất 2 phương án (Cột Phương án A, B...)');
          }

          let formattedAnswer: any = rawAnswer;
          if (type === 'SINGLE') {
            const letter = rawAnswer.toUpperCase().charAt(0);
            if (letter === 'A' && options[0]) formattedAnswer = options[0];
            else if (letter === 'B' && options[1]) formattedAnswer = options[1];
            else if (letter === 'C' && options[2]) formattedAnswer = options[2];
            else if (letter === 'D' && options[3]) formattedAnswer = options[3];
          } else if (type === 'MULTIPLE') {
            // Check if multiple letters like "A, C"
            const parts = rawAnswer.split(/[,;\s]+/).map(p => p.toUpperCase().trim());
            const matchedOpts: string[] = [];
            parts.forEach(p => {
              if (p === 'A' && options[0]) matchedOpts.push(options[0]);
              if (p === 'B' && options[1]) matchedOpts.push(options[1]);
              if (p === 'C' && options[2]) matchedOpts.push(options[2]);
              if (p === 'D' && options[3]) matchedOpts.push(options[3]);
            });
            formattedAnswer = matchedOpts.length > 0 ? matchedOpts : rawAnswer.split(',');
          }

          // Duplicate detection with existing questionBank
          let duplicateWithId: string | undefined = undefined;
          let maxSimilarity = 0;

          questionBank.forEach(existing => {
            const sim = computeSimilarity(questionText, existing.question);
            if (sim > maxSimilarity) {
              maxSimilarity = sim;
              duplicateWithId = existing.id;
            }
          });

          // Also check internal duplication within the file itself
          rows.forEach(prevRow => {
            const sim = computeSimilarity(questionText, prevRow.question);
            if (sim > maxSimilarity) {
              maxSimilarity = sim;
              duplicateWithId = `Dòng ${prevRow.rowIndex}`;
            }
          });

          const isDuplicate = maxSimilarity >= 0.85;

          rows.push({
            rowIndex,
            rawCode,
            type,
            difficulty,
            subject,
            gradeLevel,
            topic,
            passage,
            question: questionText,
            options: options.length > 0 ? options : undefined,
            correctAnswer: formattedAnswer,
            explanation,
            points,
            errors,
            isDuplicate,
            duplicateWithId: isDuplicate ? duplicateWithId : undefined,
            duplicateScore: isDuplicate ? Math.round(maxSimilarity * 100) : undefined,
            isValid: errors.length === 0,
          });
        });

        setParsedRows(rows);
        showToast('info', `Đã phân tích xong ${rows.length} dòng từ file Excel!`);
      } catch (err: any) {
        showToast('error', `Lỗi khi đọc file Excel: ${err.message || 'Sai định dạng'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Parse Word / Text Format
  const handleParseWordText = () => {
    if (!wordText.trim()) {
      showToast('error', 'Vui lòng dán văn bản câu hỏi vào ô bên dưới!');
      return;
    }

    setIsProcessing(true);
    try {
      // Split text into question blocks based on "Câu X:" or "Câu X ["
      const blocks = wordText.split(/(?=\n?\s*Câu\s+\d+[:\s\[])/i).filter(b => b.trim());

      if (blocks.length === 0) {
        showToast('error', 'Không tìm thấy câu hỏi nào theo định dạng "Câu 1:", "Câu 2:"...!');
        setIsProcessing(false);
        return;
      }

      const rows: ParsedQuestionRow[] = [];

      blocks.forEach((block, idx) => {
        const rowIndex = idx + 1;
        const lines = block
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        const errors: string[] = [];

        // Extract Header line (e.g., "Câu 1 [NB] [Trắc nghiệm]: Điều kiện...")
        const headerLine = lines[0] || '';
        const matchQ = headerLine.match(/Câu\s+\d+[^:]*:\s*(.*)/i);
        const questionText = matchQ ? matchQ[1].trim() : headerLine.replace(/^Câu\s+\d+[^:]*/i, '').trim();

        if (!questionText) {
          errors.push('Thiếu nội dung câu hỏi ở dòng đầu');
        }

        // Detect difficulty in brackets: [NB], [TH], [VD], [VDC]
        const diffMatch = headerLine.match(/\[(NB|TH|VD|VDC|Nhận biết|Thông hiểu|Vận dụng|Vận dụng cao)\]/i);
        const difficulty = diffMatch ? parseDifficulty(diffMatch[1]) : 'THONG_HIEU';

        // Detect question type
        const typeMatch = headerLine.match(/\[(Trắc nghiệm|Nhiều đáp án|Đúng sai|Điền khuyết|Tự luận)\]/i);
        const type = typeMatch ? parseType(typeMatch[1]) : 'SINGLE';

        // Extract Options A, B, C, D
        const options: string[] = [];
        let correctAnswer = '';
        let explanation = '';

        lines.slice(1).forEach(line => {
          const optMatch = line.match(/^([A-D])[\.\:\)]\s*(.*)/i);
          if (optMatch) {
            options.push(optMatch[2].trim());
          }

          const ansMatch = line.match(/^Đáp\s*án\s*[:\=]\s*(.*)/i);
          if (ansMatch) {
            correctAnswer = ansMatch[1].trim();
          }

          const expMatch = line.match(/^Lời\s*giải\s*[:\=]\s*(.*)/i);
          if (expMatch) {
            explanation = expMatch[1].trim();
          }
        });

        if (!correctAnswer && type !== 'ESSAY') {
          errors.push('Thiếu dòng "Đáp án: ..."');
        }

        if (type === 'SINGLE' && options.length < 2) {
          errors.push('Câu hỏi trắc nghiệm cần các phương án A. B. C. D.');
        }

        // Map answer letter to option text
        let formattedAnswer: any = correctAnswer;
        if (type === 'SINGLE') {
          const letter = correctAnswer.toUpperCase().charAt(0);
          if (letter === 'A' && options[0]) formattedAnswer = options[0];
          else if (letter === 'B' && options[1]) formattedAnswer = options[1];
          else if (letter === 'C' && options[2]) formattedAnswer = options[2];
          else if (letter === 'D' && options[3]) formattedAnswer = options[3];
        }

        // Duplicate detection
        let maxSimilarity = 0;
        let duplicateWithId: string | undefined = undefined;

        questionBank.forEach(existing => {
          const sim = computeSimilarity(questionText, existing.question);
          if (sim > maxSimilarity) {
            maxSimilarity = sim;
            duplicateWithId = existing.id;
          }
        });

        const isDuplicate = maxSimilarity >= 0.85;

        rows.push({
          rowIndex,
          rawCode: `WORD-${rowIndex}`,
          type,
          difficulty,
          subject: defaultSubject,
          gradeLevel: defaultGrade,
          question: questionText,
          options: options.length > 0 ? options : undefined,
          correctAnswer: formattedAnswer || correctAnswer,
          explanation,
          points: 1.0,
          errors,
          isDuplicate,
          duplicateWithId: isDuplicate ? duplicateWithId : undefined,
          duplicateScore: isDuplicate ? Math.round(maxSimilarity * 100) : undefined,
          isValid: errors.length === 0,
        });
      });

      setParsedRows(rows);
      showToast('info', `Đã bóc tách thành công ${rows.length} câu hỏi từ văn bản!`);
    } catch (err: any) {
      showToast('error', `Lỗi xử lý văn bản: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Rows for display
  const displayRows = useMemo(() => {
    return parsedRows.filter(r => {
      if (filterMode === 'valid') return r.isValid && (!excludeDuplicates || !r.isDuplicate);
      if (filterMode === 'errors') return !r.isValid;
      if (filterMode === 'duplicates') return r.isDuplicate;
      return true;
    });
  }, [parsedRows, filterMode, excludeDuplicates]);

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;

  // Import into Question Bank
  const handleConfirmImport = () => {
    const toImport = parsedRows
      .filter(r => r.isValid && (!excludeDuplicates || !r.isDuplicate))
      .map((r, idx) => ({
        id: `qb-imp-${Date.now()}-${idx + 1}`,
        code: r.rawCode || `QB-${Date.now().toString(36).slice(-4)}-${idx + 1}`,
        question: r.question,
        type: r.type,
        difficulty: r.difficulty,
        subject: r.subject || defaultSubject,
        gradeLevel: r.gradeLevel || defaultGrade,
        topic: r.topic || 'Import tổng hợp',
        passage: r.passage,
        options: r.options,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation,
        points: r.points || 1.0,
        tags: [r.subject || defaultSubject, 'Đã import'],
        createdAt: new Date().toISOString(),
      }));

    if (toImport.length === 0) {
      showToast('error', 'Không có câu hỏi hợp lệ nào thỏa mãn điều kiện để import!');
      return;
    }

    importQuestionBankItems(toImport);
    onSuccess(toImport.length);
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <Upload className="w-5 h-5 text-cyan-400" />
          <span>Import câu hỏi chuẩn hóa từ Excel & Word</span>
        </div>
      }
    >
      <div className="space-y-5 text-xs text-slate-200">
        {/* Source Switcher: Excel vs Word */}
        <div className="flex items-center justify-between border-b border-[#0f2d56] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-[#071933] text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Import từ file Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('word')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'word'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-[#071933] text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Nhập văn bản chuẩn Word / Text</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={activeTab === 'excel' ? downloadSampleExcel : downloadSampleWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file mẫu chuẩn ({activeTab === 'excel' ? 'Excel' : 'Word'})</span>
            </button>
          </div>
        </div>

        {/* Global Settings: Subject and Grade Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#071933] rounded-2xl border border-[#11315e]">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Môn học mặc định</label>
            <select
              value={defaultSubject}
              onChange={e => setDefaultSubject(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#040d1a] border border-[#1b3d6f] rounded-xl text-white font-semibold focus:outline-none"
            >
              <option value="Toán học">Toán học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Khoa học tự nhiên (Vật lý)">Khoa học tự nhiên (Vật lý)</option>
              <option value="Khoa học tự nhiên (Hóa học)">Khoa học tự nhiên (Hóa học)</option>
              <option value="Khoa học tự nhiên (Sinh học)">Khoa học tự nhiên (Sinh học)</option>
              <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
              <option value="Tin học">Tin học</option>
              <option value="Giáo dục công dân">Giáo dục công dân</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Khối lớp mặc định</label>
            <select
              value={defaultGrade}
              onChange={e => setDefaultGrade(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#040d1a] border border-[#1b3d6f] rounded-xl text-white font-semibold focus:outline-none"
            >
              <option value={6}>Khối 6</option>
              <option value={7}>Khối 7</option>
              <option value={8}>Khối 8</option>
              <option value={9}>Khối 9</option>
            </select>
          </div>
        </div>

        {/* TAB 1: EXCEL UPLOAD */}
        {activeTab === 'excel' && (
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-[#1b3d6f] rounded-2xl bg-[#071933]/60 hover:bg-[#071933] transition-colors text-center">
              <input
                type="file"
                id="excelQuestionInput"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <label
                htmlFor="excelQuestionInput"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Nhấp để chọn file Excel hoặc kéo thả vào đây</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Hỗ trợ định dạng .xlsx, .xls có sẵn các cột: Nội dung câu hỏi, Đáp án đúng, Phương án A, B, C, D...
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: WORD / TEXT PASTE */}
        {activeTab === 'word' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                Dán nội dung câu hỏi chuẩn hóa từ Word / Google Docs / Text:
              </label>
              <span className="text-[11px] text-slate-400">Cú pháp: Câu 1 [NB]: ... A. ... B. ... Đáp án: A</span>
            </div>
            <textarea
              rows={6}
              value={wordText}
              onChange={e => setWordText(e.target.value)}
              placeholder={`Dán nội dung đề bài vào đây. Ví dụ:\nCâu 1 [NB]: Giá trị của biểu thức √(4) là bao nhiêu?\nA. 2\nB. -2\nC. 4\nD. 16\nĐáp án: A\nLời giải: Căn bậc hai số học của 4 là 2.\n\nCâu 2 [TH]: Khẳng định nào sau đây là đúng?...`}
              className="w-full p-3.5 bg-[#040d1a] border border-[#1b3d6f] rounded-2xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseWordText}
                disabled={isProcessing || !wordText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Bóc tách & Kiểm tra dữ liệu (Validation)</span>
              </button>
            </div>
          </div>
        )}

        {/* PARSED RESULTS & VALIDATION DASHBOARD */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-[#0f2d56]">
            {/* Status Metric Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#071933] text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('valid')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    filterMode === 'valid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hợp lệ ({validCount})</span>
                </button>
                {errorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('errors')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'errors'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Lỗi cú pháp ({errorCount})</span>
                  </button>
                )}
                {duplicateCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('duplicates')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'duplicates'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Trùng lặp ({duplicateCount})</span>
                  </button>
                )}
              </div>

              {/* Duplicate Auto-Skip Toggle */}
              {duplicateCount > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={excludeDuplicates}
                    onChange={e => setExcludeDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800"
                  />
                  <span className="text-amber-300 font-semibold">Tự động bỏ qua các câu trùng lặp</span>
                </label>
              )}
            </div>

            {/* Questions Table Preview */}
            <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-[#1b3d6f] bg-[#040d1a]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#11315e] bg-[#071933] text-slate-400 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10">
                    <th className="py-2.5 px-3 w-14 text-center">Dòng</th>
                    <th className="py-2.5 px-3 w-28">Dạng câu</th>
                    <th className="py-2.5 px-3 w-24">Mức độ</th>
                    <th className="py-2.5 px-4">Nội dung câu hỏi & Đáp án</th>
                    <th className="py-2.5 px-3 w-32 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c2448]">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Không có dữ liệu trong bộ lọc này.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map(row => (
                      <tr
                        key={row.rowIndex}
                        className={`hover:bg-[#071933]/50 transition-colors ${
                          !row.isValid ? 'bg-rose-950/20' : row.isDuplicate ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                          #{row.rowIndex}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 font-bold text-[10px] border border-blue-800">
                            {row.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              row.difficulty === 'NHAN_BIET'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : row.difficulty === 'THONG_HIEU'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : row.difficulty === 'VAN_DUNG'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}
                          >
                            {row.difficulty === 'NHAN_BIET'
                              ? 'Nhận biết'
                              : row.difficulty === 'THONG_HIEU'
                              ? 'Thông hiểu'
                              : row.difficulty === 'VAN_DUNG'
                              ? 'Vận dụng'
                              : 'Vận dụng cao'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-100">{row.question}</p>
                          {row.options && row.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[11px] text-slate-400">
                              {row.options.map((opt, i) => (
                                <span key={i} className="truncate">
                                  {String.fromCharCode(65 + i)}. {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-400 font-bold">
                              Đáp án: {Array.isArray(row.correctAnswer) ? row.correctAnswer.join(', ') : String(row.correctAnswer)}
                            </span>
                            {row.explanation && (
                              <span className="text-slate-400 truncate max-w-xs">
                                • Giải: {row.explanation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {!row.isValid ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                                <XCircle className="w-3 h-3" />
                                Lỗi
                              </span>
                              <div className="text-[10px] text-rose-400 text-left">
                                {row.errors.map((err, i) => (
                                  <div key={i}>• {err}</div>
                                ))}
                              </div>
                            </div>
                          ) : row.isDuplicate ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                Trùng {row.duplicateScore}%
                              </span>
                              <p className="text-[10px] text-amber-400">Trùng với {row.duplicateWithId}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Hợp lệ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 flex-wrap gap-3">
              <div className="text-xs text-slate-400">
                Sẵn sàng import:{' '}
                <strong className="text-emerald-400">
                  {parsedRows.filter(r => r.isValid && (!excludeDuplicates || !r.isDuplicate)).length}
                </strong>{' '}
                / {parsedRows.length} câu hỏi
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Xóa kết quả
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={parsedRows.filter(r => r.isValid && (!excludeDuplicates || !r.isDuplicate)).length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận Lưu vào Ngân hàng</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
