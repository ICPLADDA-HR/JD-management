import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';
import {
  Upload,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import type { Department, Team, Location, User } from '../../types';
import toast from 'react-hot-toast';

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: ImportUserData[]) => Promise<void>;
  locations: Location[];
  departments: Department[];
  teams: Team[];
  jobGrades: { id: string; name: string }[];
  existingUsers: User[];
}

export interface ImportUserData {
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'viewer';
  jobGrade: string | null;
  locationId: string;
  departmentId: string;
  teamId: string;
}

interface ParsedRow {
  rowNumber: number;
  data: {
    email: string;
    fullName: string;
    role: string;
    jobGrade: string;
    locationName: string;
    departmentName: string;
    teamName: string;
  };
  errors: string[];
  isValid: boolean;
  resolvedData?: ImportUserData;
}

export const UserImportModal: React.FC<UserImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  locations,
  departments,
  teams,
  jobGrades,
  existingUsers,
}) => {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        email: 'somchai@example.com',
        full_name: 'สมชาย ใจดี',
        role: 'viewer',
        job_grade: '1.1',
        types_name: locations[0]?.name || 'Back Office',
        department_name: departments[0]?.name || 'IT',
        team_name: teams[0]?.name || 'Development',
      },
      {
        email: 'somying@example.com',
        full_name: 'สมหญิง รักเรียน',
        role: 'manager',
        job_grade: '2.1',
        types_name: locations[0]?.name || 'Back Office',
        department_name: departments[0]?.name || 'IT',
        team_name: teams[0]?.name || 'Development',
      },
      {
        email: 'admin@example.com',
        full_name: 'ผู้ดูแลระบบ',
        role: 'admin',
        job_grade: '3.1',
        types_name: locations[0]?.name || 'Back Office',
        department_name: departments[0]?.name || 'IT',
        team_name: teams[0]?.name || 'Development',
      },
    ];

    // Create workbook with data sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // email
      { wch: 20 }, // full_name
      { wch: 10 }, // role
      { wch: 10 }, // job_grade
      { wch: 20 }, // types_name
      { wch: 20 }, // department_name
      { wch: 20 }, // team_name
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Create reference sheet with valid values
    // Extract valid job grade values from jobGrades prop
    const validJobGradeValues = jobGrades.map(jg => {
      const match = jg.name.match(/JG (\d+\.?\d*)/);
      return match ? match[1] : jg.name;
    }).join(', ') || '1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5';

    const refData = [
      { column: 'role', valid_values: 'admin, manager, viewer' },
      {
        column: 'job_grade',
        valid_values: `${validJobGradeValues} (หรือเว้นว่าง)`,
      },
      { column: 'types_name', valid_values: locations.map((l) => l.name).join(', ') || 'ไม่มีข้อมูล' },
      { column: 'department_name', valid_values: departments.map((d) => d.name).join(', ') || 'ไม่มีข้อมูล' },
      { column: 'team_name', valid_values: 'ขึ้นกับ department - ดูรายละเอียดด้านล่าง' },
    ];

    const refWs = XLSX.utils.json_to_sheet(refData);
    refWs['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, refWs, 'Valid Values');

    // Create teams reference sheet
    const teamsData = teams.map((t) => {
      const dept = departments.find((d) => d.id === t.department_id);
      return {
        department_name: dept?.name || 'Unknown',
        team_name: t.name,
      };
    });

    if (teamsData.length > 0) {
      const teamsWs = XLSX.utils.json_to_sheet(teamsData);
      teamsWs['!cols'] = [{ wch: 25 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, teamsWs, 'Teams by Department');
    }

    // Download
    XLSX.writeFile(wb, 'user_import_template.xlsx');
    toast.success('ดาวน์โหลด Template สำเร็จ');
  };

  // Parse uploaded file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

      if (jsonData.length === 0) {
        toast.error('ไฟล์ว่างเปล่า หรือไม่มีข้อมูล');
        setParsedData([]);
        return;
      }

      // Parse and validate each row
      const parsed: ParsedRow[] = jsonData.map((row, index) => {
        const errors: string[] = [];
        const rowData = {
          email: String(row.email || '').trim(),
          fullName: String(row.full_name || '').trim(),
          role: String(row.role || '').trim().toLowerCase(),
          jobGrade: String(row.job_grade || '').trim(),
          locationName: String(row.types_name || '').trim(),
          departmentName: String(row.department_name || '').trim(),
          teamName: String(row.team_name || '').trim(),
        };

        // Validate email
        if (!rowData.email) {
          errors.push('Email จำเป็น');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
          errors.push('รูปแบบ Email ไม่ถูกต้อง');
        } else if (existingUsers.some((u) => u.email.toLowerCase() === rowData.email.toLowerCase())) {
          errors.push('Email นี้มีในระบบแล้ว');
        }

        // Validate full_name
        if (!rowData.fullName) {
          errors.push('ชื่อ-นามสกุล จำเป็น');
        }

        // Validate role
        const validRoles = ['admin', 'manager', 'viewer'];
        if (!rowData.role) {
          errors.push('Role จำเป็น');
        } else if (!validRoles.includes(rowData.role)) {
          errors.push(`Role ไม่ถูกต้อง (ต้องเป็น: ${validRoles.join(', ')})`);
        }

        // Validate job_grade (optional)
        const validJobGrades = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '5', ''];
        if (rowData.jobGrade && !validJobGrades.includes(rowData.jobGrade)) {
          errors.push(`Job Grade ไม่ถูกต้อง (ต้องเป็น: ${validJobGrades.filter(Boolean).join(', ')})`);
        }

        // Find types (location)
        const location = locations.find(
          (l) => l.name.toLowerCase() === rowData.locationName.toLowerCase()
        );
        if (!rowData.locationName) {
          errors.push('Types จำเป็น');
        } else if (!location) {
          errors.push(`ไม่พบ Types: ${rowData.locationName}`);
        }

        // Find department
        const department = departments.find(
          (d) => d.name.toLowerCase() === rowData.departmentName.toLowerCase()
        );
        if (!rowData.departmentName) {
          errors.push('Department จำเป็น');
        } else if (!department) {
          errors.push(`ไม่พบ Department: ${rowData.departmentName}`);
        }

        // Find team (must be in selected department)
        let team = null;
        if (department) {
          team = teams.find(
            (t) =>
              t.name.toLowerCase() === rowData.teamName.toLowerCase() &&
              t.department_id === department.id
          );
          if (!rowData.teamName) {
            errors.push('Team จำเป็น');
          } else if (!team) {
            errors.push(`ไม่พบ Team: ${rowData.teamName} ใน Department: ${rowData.departmentName}`);
          }
        }

        const isValid = errors.length === 0;
        const resolvedData: ImportUserData | undefined = isValid
          ? {
              email: rowData.email,
              fullName: rowData.fullName,
              role: rowData.role as 'admin' | 'manager' | 'viewer',
              jobGrade: rowData.jobGrade || null,
              locationId: location!.id,
              departmentId: department!.id,
              teamId: team!.id,
            }
          : undefined;

        return {
          rowNumber: index + 2, // Excel rows start at 1, plus header
          data: rowData,
          errors,
          isValid,
          resolvedData,
        };
      });

      setParsedData(parsed);

      const validCount = parsed.filter((p) => p.isValid).length;
      const invalidCount = parsed.filter((p) => !p.isValid).length;

      if (invalidCount > 0) {
        toast.error(`พบ ${invalidCount} รายการที่มีข้อผิดพลาด`);
      } else {
        toast.success(`พบ ${validCount} รายการพร้อมนำเข้า`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('ไม่สามารถอ่านไฟล์ได้');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((p) => p.isValid && p.resolvedData);
    if (validRows.length === 0) {
      toast.error('ไม่มีข้อมูลที่พร้อมนำเข้า');
      return;
    }

    setIsImporting(true);
    try {
      await onImport(validRows.map((r) => r.resolvedData!));
      toast.success(`นำเข้าสำเร็จ ${validRows.length} รายการ`);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการนำเข้า');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const validCount = parsedData.filter((p) => p.isValid).length;
  const invalidCount = parsedData.filter((p) => !p.isValid).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-body-lg font-semibold text-primary-600">
                นำเข้าผู้ใช้จาก Excel
              </h2>
              <p className="text-caption text-primary-400">
                อัปโหลดไฟล์ Excel เพื่อเพิ่มผู้ใช้หลายคนพร้อมกัน
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-primary-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Download Template */}
          <div className="mb-6">
            <h3 className="text-body-sm font-medium text-primary-600 mb-3">
              ขั้นตอนที่ 1: ดาวน์โหลด Template
            </h3>
            <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-body-sm text-primary-600">
                    user_import_template.xlsx
                  </p>
                  <p className="text-caption text-primary-400">
                    มีตัวอย่างข้อมูลและค่าที่ใช้ได้
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadTemplate}
                icon={<Download className="w-4 h-4" />}
              >
                ดาวน์โหลด Template
              </Button>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="mb-6">
            <h3 className="text-body-sm font-medium text-primary-600 mb-3">
              ขั้นตอนที่ 2: อัปโหลดไฟล์
            </h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                fileName
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-primary-200 hover:border-primary-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-primary-400 mx-auto mb-3" />
                {fileName ? (
                  <p className="text-body-sm text-primary-600">{fileName}</p>
                ) : (
                  <>
                    <p className="text-body-sm text-primary-600 mb-1">
                      คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-caption text-primary-400">
                      รองรับไฟล์ .xlsx และ .xls
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-primary-600">กำลังประมวลผล...</span>
            </div>
          )}

          {/* Step 3: Preview Data */}
          {parsedData.length > 0 && !isProcessing && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-body-sm font-medium text-primary-600">
                  ขั้นตอนที่ 3: ตรวจสอบข้อมูล
                </h3>
                <div className="flex items-center gap-4 text-caption">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    ถูกต้อง: {validCount}
                  </span>
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      มีข้อผิดพลาด: {invalidCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-primary-200 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-caption">
                    <thead className="bg-primary-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          แถว
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          ชื่อ-นามสกุล
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          Role
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          JG
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-primary-600">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100">
                      {parsedData.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.isValid ? 'bg-green-50/50' : 'bg-red-50/50'
                          }
                        >
                          <td className="px-3 py-2 text-primary-500">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2 text-primary-600">
                            {row.data.email || '-'}
                          </td>
                          <td className="px-3 py-2 text-primary-600">
                            {row.data.fullName || '-'}
                          </td>
                          <td className="px-3 py-2 text-primary-600">
                            {row.data.role || '-'}
                          </td>
                          <td className="px-3 py-2 text-primary-600">
                            {row.data.jobGrade || '-'}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                พร้อม
                              </span>
                            ) : (
                              <div className="text-red-600">
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  มีข้อผิดพลาด
                                </span>
                                <ul className="mt-1 text-[10px] list-disc list-inside">
                                  {row.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary-200 flex justify-between items-center">
          <div className="text-caption text-primary-400">
            {parsedData.length > 0 && (
              <>
                พร้อมนำเข้า <span className="font-medium text-primary-600">{validCount}</span> รายการ
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || isImporting}
              loading={isImporting}
              icon={<Upload className="w-4 h-4" />}
            >
              นำเข้า {validCount > 0 ? `(${validCount} รายการ)` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
