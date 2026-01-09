import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { useDepartments } from '../../hooks/useDepartments';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Team } from '../../types';

function SortableTeam({
  team,
  departmentName,
  onEdit,
  onDelete
}: {
  team: Team;
  departmentName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: team.id });

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
        <p className="text-body-lg font-medium text-primary-600">{team.name}</p>
        <p className="text-body-sm text-primary-400 mt-1">{departmentName}</p>
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

export const TeamsPage = () => {
  const { teams, loading, addTeam, updateTeam, deleteTeam, reorderTeams } = useTeams();
  const { departments } = useDepartments();
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Team | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDepartmentId) return;

    setSubmitting(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, formName.trim(), formDepartmentId);
      } else {
        await addTeam(formName.trim(), formDepartmentId);
      }
      setShowModal(false);
      setFormName('');
      setFormDepartmentId('');
      setEditingTeam(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormName(team.name);
    setFormDepartmentId(team.department_id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await deleteTeam(deleteConfirm.id);
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

    const oldIndex = teams.findIndex((t) => t.id === active.id);
    const newIndex = teams.findIndex((t) => t.id === over.id);

    const newTeams = [...teams];
    const [movedItem] = newTeams.splice(oldIndex, 1);
    newTeams.splice(newIndex, 0, movedItem);

    reorderTeams(newTeams);
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
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
          <h1 className="text-heading-1 font-semibold text-primary-600">Teams</h1>
          <p className="text-body text-primary-400 mt-2">Manage teams within departments</p>
        </div>
        <Button
          onClick={() => {
            setEditingTeam(null);
            setFormName('');
            setFormDepartmentId('');
            setShowModal(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Team
        </Button>
      </div>

      <div className="space-y-3">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {teams.map((team) => (
              <SortableTeam
                key={team.id}
                team={team}
                departmentName={getDepartmentName(team.department_id)}
                onEdit={() => handleEdit(team)}
                onDelete={() => setDeleteConfirm(team)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {teams.length === 0 && (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
            <p className="text-body text-primary-400">No teams found. Add your first team!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTeam ? 'Edit Team' : 'Add Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter team name"
            required
            autoFocus
          />
          <Select
            label="Department"
            value={formDepartmentId}
            onChange={(e) => setFormDepartmentId(e.target.value)}
            required
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingTeam ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also remove team assignments from users.`}
        confirmText="Delete"
        danger
        loading={submitting}
      />
    </div>
  );
};
