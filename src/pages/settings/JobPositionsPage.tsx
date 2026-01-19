import { useState } from 'react';
import { useJobPositions } from '../../hooks/useJobPositions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import type { JobPosition } from '../../hooks/useJobPositions';
import toast from 'react-hot-toast';

export const JobPositionsPage = () => {
  const { positions, loading, addPosition, updatePosition, deletePosition, bulkImport } = useJobPositions();
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<JobPosition | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, formName.trim(), formDescription.trim() || undefined);
      } else {
        await addPosition(formName.trim(), formDescription.trim() || undefined);
      }
      setShowModal(false);
      setFormName('');
      setFormDescription('');
      setEditingPosition(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (position: JobPosition) => {
    setEditingPosition(position);
    setFormName(position.name);
    setFormDescription(position.description || '');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await deletePosition(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        // Skip header if exists
        const startIndex = lines[0].toLowerCase().includes('position') || lines[0].toLowerCase().includes('name') ? 1 : 0;
        const positionsToImport = lines.slice(startIndex).map(line => ({
          name: line.trim()
        })).filter(p => p.name);

        if (positionsToImport.length === 0) {
          toast.error('ไม่พบข้อมูลในไฟล์');
          return;
        }

        await bulkImport(positionsToImport);
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('ไม่สามารถอ่านไฟล์ได้');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-heading-1 font-semibold text-primary-600">Job Positions</h1>
          <p className="text-body text-primary-400 mt-2">จัดการตำแหน่งงานในองค์กร</p>
        </div>
        <div className="flex gap-3">
          <label htmlFor="import-file">
            <Button
              as="span"
              variant="secondary"
              icon={<Upload className="w-5 h-5" />}
            >
              นำเข้าจากไฟล์
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".txt,.csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => {
              setEditingPosition(null);
              setFormName('');
              setFormDescription('');
              setShowModal(true);
            }}
            icon={<Plus className="w-5 h-5" />}
          >
            เพิ่มตำแหน่งงาน
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ตำแหน่งงาน
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คำอธิบาย
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-body-lg font-medium text-primary-600">{position.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-body text-gray-500">{position.description || '-'}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(position)}
                      icon={<Edit2 className="w-4 h-4" />}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(position)}
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      ลบ
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {positions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-body text-primary-400">ยังไม่มีตำแหน่งงาน เพิ่มตำแหน่งแรกของคุณ!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPosition(null);
          setFormName('');
          setFormDescription('');
        }}
        title={editingPosition ? 'แก้ไขตำแหน่งงาน' : 'เพิ่มตำแหน่งงาน'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อตำแหน่งงาน"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="กรอกชื่อตำแหน่งงาน"
            required
            autoFocus
          />
          <Input
            label="คำอธิบาย (ไม่บังคับ)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="กรอกคำอธิบายตำแหน่งงาน"
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingPosition(null);
                setFormName('');
                setFormDescription('');
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" loading={submitting}>
              {editingPosition ? 'บันทึก' : 'เพิ่ม'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="ลบตำแหน่งงาน"
        message={`คุณแน่ใจหรือไม่ที่จะลบ "${deleteConfirm?.name}"? การลบนี้อาจส่งผลต่อ Job Description ที่เกี่ยวข้อง`}
        confirmText="ลบ"
        danger
        loading={submitting}
      />
    </div>
  );
};
