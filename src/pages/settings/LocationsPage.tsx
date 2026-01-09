import { useState } from 'react';
import { useLocations } from '../../hooks/useLocations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Location } from '../../types';

function SortableLocation({ location, onEdit, onDelete }: {
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: location.id });

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
        <p className="text-body-lg font-medium text-primary-600">{location.name}</p>
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

export const LocationsPage = () => {
  const { locations, loading, addLocation, updateLocation, deleteLocation, reorderLocations } = useLocations();
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formName, setFormName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formName.trim());
      } else {
        await addLocation(formName.trim());
      }
      setShowModal(false);
      setFormName('');
      setEditingLocation(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormName(location.name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await deleteLocation(deleteConfirm.id);
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

    const oldIndex = locations.findIndex((l) => l.id === active.id);
    const newIndex = locations.findIndex((l) => l.id === over.id);

    const newLocations = [...locations];
    const [movedItem] = newLocations.splice(oldIndex, 1);
    newLocations.splice(newIndex, 0, movedItem);

    reorderLocations(newLocations);
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
          <h1 className="text-heading-1 font-semibold text-primary-600">Locations</h1>
          <p className="text-body text-primary-400 mt-2">Manage office locations</p>
        </div>
        <Button
          onClick={() => {
            setEditingLocation(null);
            setFormName('');
            setShowModal(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Location
        </Button>
      </div>

      <div className="space-y-3">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={locations.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {locations.map((location) => (
              <SortableLocation
                key={location.id}
                location={location}
                onEdit={() => handleEdit(location)}
                onDelete={() => setDeleteConfirm(location)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {locations.length === 0 && (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
            <p className="text-body text-primary-400">No locations found. Add your first location!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter location name"
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingLocation ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
        loading={submitting}
      />
    </div>
  );
};
