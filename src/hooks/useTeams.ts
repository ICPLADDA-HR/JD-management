import { useState, useEffect } from 'react';
import { teamsAPI } from '../lib/api';
import type { Team } from '../types';
import toast from 'react-hot-toast';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamsAPI.getAll();
      setTeams(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch teams';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsByDepartment = async (departmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamsAPI.getByDepartment(departmentId);
      setTeams(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch teams';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (name: string, departmentId: string) => {
    setLoading(true);
    try {
      const newTeam = await teamsAPI.create({ 
        name, 
        department_id: departmentId, 
        order_index: teams.filter(t => t.department_id === departmentId).length 
      });
      setTeams(prev => [...prev, newTeam]);
      toast.success('Team added successfully!');
    } catch (err) {
      const errorMessage = 'Failed to add team';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (id: string, name: string, departmentId?: string) => {
    setLoading(true);
    try {
      const updates: any = { name };
      if (departmentId) updates.department_id = departmentId;
      
      const updatedTeam = await teamsAPI.update(id, updates);
      setTeams(prev => prev.map(team => team.id === id ? updatedTeam : team));
      toast.success('Team updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update team';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id: string) => {
    setLoading(true);
    try {
      await teamsAPI.delete(id);
      setTeams(prev => prev.filter(team => team.id !== id));
      toast.success('Team deleted successfully!');
    } catch (err) {
      const errorMessage = 'Failed to delete team';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderTeams = async (newOrder: Team[]) => {
    // Optimistically update the UI
    setTeams(newOrder);
    
    try {
      // Update order_index for each team
      const updates = newOrder.map((team, index) => 
        teamsAPI.update(team.id, { order_index: index })
      );
      await Promise.all(updates);
      toast.success('Teams reordered successfully!');
    } catch (err) {
      // Revert on error
      fetchTeams();
      const errorMessage = 'Failed to reorder teams';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    fetchTeamsByDepartment,
    addTeam,
    updateTeam,
    deleteTeam,
    reorderTeams,
    refetch: fetchTeams,
  };
};