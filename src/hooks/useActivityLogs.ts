import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLog, ActivityAction, ActivityEntityType } from '../types';
import toast from 'react-hot-toast';

// Helper function to log activity (can be used from other hooks)
export const logActivity = async (
  userId: string,
  action: ActivityAction,
  entityType: ActivityEntityType,
  entityId: string | null,
  description: string,
  metadata?: Record<string, any>
) => {
  console.log('=== logActivity called ===');
  console.log('userId:', userId);
  console.log('action:', action);
  console.log('entityType:', entityType);
  console.log('entityId:', entityId);
  console.log('description:', description);
  console.log('metadata:', metadata);

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
        metadata: metadata || {},
      })
      .select();

    if (error) {
      console.error('=== Error logging activity ===');
      console.error('Error:', error);
    } else {
      console.log('=== Activity logged successfully ===');
      console.log('Inserted data:', data);
    }
  } catch (error) {
    console.error('=== Exception logging activity ===');
    console.error('Error:', error);
  }
};

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    console.log('=== fetchActivityLogs called ===');
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

      console.log('=== Activity logs fetched ===');
      console.log('Total logs:', data?.length);
      data?.forEach((log, i) => {
        console.log(`Fetched log ${i}: action="${log.action}", metadata=`, log.metadata);
      });

      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      // Don't show error toast if table doesn't exist yet
      if (!error.message?.includes('does not exist')) {
        toast.error('Failed to load activity logs');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    loading,
    refetch: fetchActivityLogs,
    logActivity,
  };
};
