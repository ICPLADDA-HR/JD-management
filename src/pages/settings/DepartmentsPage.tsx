import { useState } from 'react';
import { useDepartments } from '../../hooks/useDepartments';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Department } from '../../types';

function SortableDepartment({ department, onEdit, onDelete }: {
  department: Department;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: department.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-6 p-6 bg-white/60 backdrop-blur-sm border border-primary-100 rounded-2xl hover:bg-white hover:shadow-apple transition-all duration-200"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-primary-300 hover:text-primary-500 transition-colors duration-200"
      >
        <GripVertical className="w-6 h-6" />
      </button>
      <div className="flex-1">
        <p className="text-body-lg font-medium text-primary-600">{department.name}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} icon={<Edit2 className="w-4 h-4" />}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} icon={<Trash2 className="w-4 h-4" />}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export const DepartmentsPage = () => {
  const { departments, loading, addDepartment, updateDepartment, deleteDepartment, reorderDepartments } = useDepartments();
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formName, setFormName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formName.trim());
      } else {
        await addDepartment(formName.trim());
      }
      setShowModal(false);
      setFormName('');
      setEditingDepartment(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormName(department.name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await deleteDepartment(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = departments.findIndex((d) => d.id === active.id);
    const newIndex = departments.findIndex((d) => d.id === over.id);

    const newDepartments = [...departments];
    const [movedItem] = newDepartments.splice(oldIndex, 1);
    newDepartments.splice(newIndex, 0, movedItem);

    reorderDepartments(newDepartments);
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
          <h1 className="text-heading-1 font-semibold text-primary-600">Departments</h1>
          <p className="text-body text-primary-400 mt-2">Manage organization departments</p>
        </div>
        <Button
          onClick={() => {
            setEditingDepartment(null);
            setFormName('');
            setShowModal(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Department
        </Button>
      </div>

      <div className="space-y-3">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={departments.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {departments.map((department) => (
              <SortableDepartment
                key={department.id}
                department={department}
                onEdit={() => handleEdit(department)}
                onDelete={() => setDeleteConfirm(department)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {departments.length === 0 && (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
            <p className="text-body text-primary-400">No departments found. Add your first department!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter department name"
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingDepartment ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also delete all teams in this department.`}
        confirmText="Delete"
        danger
        loading={submitting}
      />
    </div>
  );
};
