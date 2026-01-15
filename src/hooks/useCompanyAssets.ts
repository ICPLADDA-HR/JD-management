import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface CompanyAsset {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCompanyAssets = () => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_assets')
        .select('*')
        .order('name');

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading company assets:', error);
      toast.error('ไม่สามารถโหลดข้อมูลทรัพย์สินได้');
    } finally {
      setLoading(false);
    }
  };

  const addAsset = async (name: string, description?: string) => {
    try {
      // Check if asset with same name already exists
      const exists = assets.some(asset => asset.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
      }

      const { data, error } = await supabase
        .from('company_assets')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
        }
        throw error;
      }

      setAssets(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('เพิ่มทรัพย์สินสำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error adding asset:', error);
      toast.error(error.message || 'ไม่สามารถเพิ่มทรัพย์สินได้');
      throw error;
    }
  };

  const updateAsset = async (id: string, name: string, description?: string) => {
    try {
      // Check if another asset with same name exists (excluding current asset)
      const exists = assets.some(asset => 
        asset.id !== id && asset.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
      }

      const { data, error } = await supabase
        .from('company_assets')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('ทรัพย์สินนี้มีอยู่แล้ว');
        }
        throw error;
      }

      setAssets(prev =>
        prev.map(asset => asset.id === id ? data : asset).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('อัปเดตทรัพย์สินสำเร็จ');
      return data;
    } catch (error: any) {
      console.error('Error updating asset:', error);
      toast.error(error.message || 'ไม่สามารถอัปเดตทรัพย์สินได้');
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== id));
      toast.success('ลบทรัพย์สินสำเร็จ');
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast.error(error.message || 'ไม่สามารถลบทรัพย์สินได้');
      throw error;
    }
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: loadAssets,
  };
};
