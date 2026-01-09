import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = {
  // Hooks
  'src/hooks/useDepartments.ts': `import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Department } from '../types';
import toast from 'react-hot-toast';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (name: string) => {
    const maxOrder = Math.max(...departments.map(d => d.order_index), 0);
    const { error } = await supabase
      .from('departments')
      .insert({ name, order_index: maxOrder + 1 });

    if (error) {
      toast.error('Failed to add department');
      throw error;
    }

    toast.success('Department added successfully');
    await loadDepartments();
  };

  const updateDepartment = async (id: string, name: string) => {
    const { error } = await supabase
      .from('departments')
      .update({ name })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update department');
      throw error;
    }

    toast.success('Department updated successfully');
    await loadDepartments();
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete department');
      throw error;
    }

    toast.success('Department deleted successfully');
    await loadDepartments();
  };

  const reorderDepartments = async (items: Department[]) => {
    try {
      for (const [index, item] of items.entries()) {
        await supabase
          .from('departments')
          .update({ order_index: index })
          .eq('id', item.id);
      }
      await loadDepartments();
    } catch (error: any) {
      toast.error('Failed to reorder departments');
      throw error;
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return {
    departments,
    loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    reorderDepartments,
    reload: loadDepartments,
  };
};`,

  'src/hooks/useTeams.ts': `import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Team } from '../types';
import toast from 'react-hot-toast';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (name: string, departmentId: string) => {
    const maxOrder = Math.max(...teams.map(t => t.order_index), 0);
    const { error } = await supabase
      .from('teams')
      .insert({ name, department_id: departmentId, order_index: maxOrder + 1 });

    if (error) {
      toast.error('Failed to add team');
      throw error;
    }

    toast.success('Team added successfully');
    await loadTeams();
  };

  const updateTeam = async (id: string, name: string, departmentId: string) => {
    const { error } = await supabase
      .from('teams')
      .update({ name, department_id: departmentId })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update team');
      throw error;
    }

    toast.success('Team updated successfully');
    await loadTeams();
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete team');
      throw error;
    }

    toast.success('Team deleted successfully');
    await loadTeams();
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return {
    teams,
    loading,
    addTeam,
    updateTeam,
    deleteTeam,
    reload: loadTeams,
  };
};`,

  'src/hooks/useCompetencies.ts': `import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Competency } from '../types';
import toast from 'react-hot-toast';

export const useCompetencies = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompetencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competencies')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCompetencies(data || []);
    } catch (error: any) {
      console.error('Error loading competencies:', error);
      toast.error('Failed to load competencies');
    } finally {
      setLoading(false);
    }
  };

  const addCompetency = async (name: string) => {
    const maxOrder = Math.max(...competencies.map(c => c.order_index), 0);
    const { error } = await supabase
      .from('competencies')
      .insert({ name, order_index: maxOrder + 1 });

    if (error) {
      toast.error('Failed to add competency');
      throw error;
    }

    toast.success('Competency added successfully');
    await loadCompetencies();
  };

  const updateCompetency = async (id: string, name: string) => {
    const { error } = await supabase
      .from('competencies')
      .update({ name })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update competency');
      throw error;
    }

    toast.success('Competency updated successfully');
    await loadCompetencies();
  };

  const deleteCompetency = async (id: string) => {
    const { error } = await supabase
      .from('competencies')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete competency');
      throw error;
    }

    toast.success('Competency deleted successfully');
    await loadCompetencies();
  };

  const reorderCompetencies = async (items: Competency[]) => {
    try {
      for (const [index, item] of items.entries()) {
        await supabase
          .from('competencies')
          .update({ order_index: index })
          .eq('id', item.id);
      }
      await loadCompetencies();
    } catch (error: any) {
      toast.error('Failed to reorder competencies');
      throw error;
    }
  };

  useEffect(() => {
    loadCompetencies();
  }, []);

  return {
    competencies,
    loading,
    addCompetency,
    updateCompetency,
    deleteCompetency,
    reorderCompetencies,
    reload: loadCompetencies,
  };
};`,
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content);
  console.log(\`Created: \${filePath}\`);
});

console.log('All hooks created successfully!');
