import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface JobPosition {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useJobPositions = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .order('name');

      if (error) throw error;
      setPositions(data || []);
    } catch (error: any) {
      console.error('Error fetching positions:', error);
      toast.error('ไม่สามารถโหลดข้อมูลตำแหน่งงานได้');
    } finally {
      setLoading(false);
    }
  };

  const addPosition = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('job_positions')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;
      
      setPositions(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('เพิ่มตำแหน่งงานสำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error adding position:', error);
      toast.error(error.message || 'ไม่สามารถเพิ่มตำแหน่งงานได้');
      throw error;
    }
  };

  const updatePosition = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setPositions(prev => 
        prev.map(pos => pos.id === id ? { ...pos, name, description, updated_at: new Date().toISOString() } : pos).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('แก้ไขตำแหน่งงานสำเร็จ');
    } catch (error: any) {
      console.error('Error updating position:', error);
      toast.error(error.message || 'ไม่สามารถแก้ไขตำแหน่งงานได้');
      throw error;
    }
  };

  const deletePosition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPositions(prev => prev.filter(pos => pos.id !== id));
      toast.success('ลบตำแหน่งงานสำเร็จ');
    } catch (error: any) {
      console.error('Error deleting position:', error);
      toast.error(error.message || 'ไม่สามารถลบตำแหน่งงานได้');
      throw error;
    }
  };

  const bulkImport = async (newPositions: Array<{ name: string }>) => {
    try {
      // Get existing position names to filter duplicates
      const existingNames = positions.map(p => p.name.toLowerCase());
      
      // Filter out duplicates
      const uniquePositions = newPositions.filter(
        p => !existingNames.includes(p.name.toLowerCase())
      );
      
      const skippedCount = newPositions.length - uniquePositions.length;
      
      if (uniquePositions.length === 0) {
        toast.error(`ตำแหน่งงานทั้งหมด ${newPositions.length} รายการมีอยู่แล้วในระบบ`);
        return [];
      }
      
      const { data, error } = await supabase
        .from('job_positions')
        .insert(uniquePositions)
        .select();

      if (error) throw error;
      
      await fetchPositions();
      
      if (skippedCount > 0) {
        toast.success(`นำเข้าสำเร็จ ${data.length} รายการ (ข้าม ${skippedCount} รายการที่ซ้ำ)`);
      } else {
        toast.success(`นำเข้าตำแหน่งงานสำเร็จ ${data.length} รายการ`);
      }
      return data;
    } catch (error: any) {
      console.error('Error importing positions:', error);
      toast.error(error.message || 'ไม่สามารถนำเข้าตำแหน่งงานได้');
      throw error;
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return {
    positions,
    loading,
    addPosition,
    updatePosition,
    deletePosition,
    bulkImport,
    refetch: fetchPositions,
  };
};
