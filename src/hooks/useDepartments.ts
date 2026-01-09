import { useState, useEffect } from 'react';
import { departmentsAPI } from '../lib/api';
import type { Department } from '../types';
import toast from 'react-hot-toast';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentsAPI.getAll();
      setDepartments(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch departments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (name: string) => {
    setLoading(true);
    try {
      const newDepartment = await departmentsAPI.create({ name, order_index: departments.length });
      setDepartments(prev => [...prev, newDepartment]);
      toast.success('Department added successfully!');
    } catch (err) {
      const errorMessage = 'Failed to add department';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id: string, name: string) => {
    setLoading(true);
    try {
      const updatedDepartment = await departmentsAPI.update(id, { name });
      setDepartments(prev => prev.map(dept => dept.id === id ? updatedDepartment : dept));
      toast.success('Department updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update department';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string) => {
    setLoading(true);
    try {
      await departmentsAPI.delete(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      toast.success('Department deleted successfully!');
    } catch (err) {
      const errorMessage = 'Failed to delete department';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderDepartments = async (newOrder: Department[]) => {
    // Optimistically update the UI
    setDepartments(newOrder);
    
    try {
      // Update order_index for each department
      const updates = newOrder.map((dept, index) => 
        departmentsAPI.update(dept.id, { order_index: index })
      );
      await Promise.all(updates);
      toast.success('Departments reordered successfully!');
    } catch (err) {
      // Revert on error
      fetchDepartments();
      const errorMessage = 'Failed to reorder departments';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    reorderDepartments,
    refetch: fetchDepartments,
  };
};