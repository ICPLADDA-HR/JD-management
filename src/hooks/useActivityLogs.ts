import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLog } from '../types';
import toast from 'react-hot-toast';

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(id, full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    refetch: fetchActivityLogs,
  };
};
