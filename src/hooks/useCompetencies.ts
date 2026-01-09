import { useState, useEffect } from 'react';
import { competenciesAPI } from '../lib/api';
import type { Competency } from '../types';
import toast from 'react-hot-toast';

export const useCompetencies = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await competenciesAPI.getAll();
      setCompetencies(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch competencies';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addCompetency = async (name: string) => {
    setLoading(true);
    try {
      const newCompetency = await competenciesAPI.create({ name, order_index: competencies.length });
      setCompetencies(prev => [...prev, newCompetency]);
      toast.success('Competency added successfully!');
    } catch (err) {
      const errorMessage = 'Failed to add competency';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompetency = async (id: string, name: string) => {
    setLoading(true);
    try {
      const updatedCompetency = await competenciesAPI.update(id, { name });
      setCompetencies(prev => prev.map(comp => comp.id === id ? updatedCompetency : comp));
      toast.success('Competency updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update competency';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompetency = async (id: string) => {
    setLoading(true);
    try {
      await competenciesAPI.delete(id);
      setCompetencies(prev => prev.filter(comp => comp.id !== id));
      toast.success('Competency deleted successfully!');
    } catch (err) {
      const errorMessage = 'Failed to delete competency';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderCompetencies = async (newOrder: Competency[]) => {
    // Optimistically update the UI
    setCompetencies(newOrder);
    
    try {
      // Update order_index for each competency
      const updates = newOrder.map((comp, index) => 
        competenciesAPI.update(comp.id, { order_index: index })
      );
      await Promise.all(updates);
      toast.success('Competencies reordered successfully!');
    } catch (err) {
      // Revert on error
      fetchCompetencies();
      const errorMessage = 'Failed to reorder competencies';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  return {
    competencies,
    loading,
    error,
    fetchCompetencies,
    addCompetency,
    updateCompetency,
    deleteCompetency,
    reorderCompetencies,
    refetch: fetchCompetencies,
  };
};