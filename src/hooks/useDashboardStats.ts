import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

interface DashboardStats {
  totalJDs: number;
  publishedJDs: number;
  draftJDs: number;
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  totalTeams: number;
  recentActivities: number;
  jdsByDepartment: Array<{ name: string; count: number }>;
  jdsByStatus: Array<{ status: string; count: number }>;
  jdsByDepartmentAndStatus: Array<{
    name: string;
    published: number;
    draft: number;
    total: number;
  }>;
  jdsByJobGrade: Array<{ name: string; count: number }>;
  topCompetencies: Array<{ name: string; count: number }>;
}

interface UserContext {
  role?: UserRole;
  teamId?: string | null;
}

export const useDashboardStats = (userContext?: UserContext) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJDs: 0,
    publishedJDs: 0,
    draftJDs: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    totalTeams: 0,
    recentActivities: 0,
    jdsByDepartment: [],
    jdsByStatus: [],
    jdsByDepartmentAndStatus: [],
    jdsByJobGrade: [],
    topCompetencies: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userContext?.role, userContext?.teamId]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch JD stats with team_id for role-based filtering
      const { data: rawJds, error: jdError } = await supabase
        .from('job_descriptions')
        .select('id, status, department_id, team_id, job_grade, department:departments(name)');

      if (jdError) throw jdError;

      // Apply role-based filtering
      // Admin: see all JDs
      // Manager/Viewer: see all Published + only Draft from their own team
      let jds = rawJds;
      if (userContext?.role && userContext.role !== 'admin') {
        jds = rawJds?.filter(jd => {
          // Always show published JDs
          if (jd.status === 'published') return true;
          // For draft JDs, only show if from user's team
          if (jd.status === 'draft') {
            return jd.team_id === userContext.teamId;
          }
          return false;
        }) || [];
      }

      // Count JDs by status
      const totalJDs = jds?.length || 0;
      const publishedJDs = jds?.filter((jd) => jd.status === 'published').length || 0;
      const draftJDs = jds?.filter((jd) => jd.status === 'draft').length || 0;

      // Count JDs by department
      const deptCounts = jds?.reduce((acc: Record<string, number>, jd: any) => {
        const deptName = jd.department?.name || 'Unknown';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {});

      const jdsByDepartment = Object.entries(deptCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // JDs by status for chart
      const jdsByStatus = [
        { status: 'Published', count: publishedJDs },
        { status: 'Draft', count: draftJDs },
      ];

      // Count JDs by department AND status (for stacked bar chart)
      const deptStatusCounts = jds?.reduce((acc: Record<string, { published: number; draft: number }>, jd: any) => {
        const deptName = jd.department?.name || 'Unknown';
        if (!acc[deptName]) {
          acc[deptName] = { published: 0, draft: 0 };
        }
        if (jd.status === 'published') acc[deptName].published++;
        else if (jd.status === 'draft') acc[deptName].draft++;
        return acc;
      }, {});

      const jdsByDepartmentAndStatus = Object.entries(deptStatusCounts || {})
        .map(([name, counts]) => ({
          name,
          published: counts.published,
          draft: counts.draft,
          total: counts.published + counts.draft,
        }))
        .sort((a, b) => b.total - a.total);

      // Count JDs by Job Grade
      const jobGradeCounts = jds?.reduce((acc: Record<string, number>, jd: any) => {
        // job_grade is stored directly as string like 'JG 1.1 Staff'
        const jobGrade = jd.job_grade || 'ไม่ระบุ';
        acc[jobGrade] = (acc[jobGrade] || 0) + 1;
        return acc;
      }, {});

      const jdsByJobGrade = Object.entries(jobGradeCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => {
          // Sort by job grade number (e.g., JG 1.1, JG 1.2, etc.)
          const aMatch = a.name.match(/(\d+)\.(\d+)/);
          const bMatch = b.name.match(/(\d+)\.(\d+)/);
          if (aMatch && bMatch) {
            const aMajor = parseInt(aMatch[1]);
            const bMajor = parseInt(bMatch[1]);
            if (aMajor !== bMajor) return aMajor - bMajor;
            return parseInt(aMatch[2]) - parseInt(bMatch[2]);
          }
          return a.name.localeCompare(b.name);
        });

      // Fetch user stats
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, is_active');

      if (userError) throw userError;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter((u) => u.is_active).length || 0;

      // Fetch department count
      const { count: deptCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      if (deptError) throw deptError;

      // Fetch team count
      const { count: teamCount, error: teamError } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      if (teamError) throw teamError;

      // Fetch recent activities count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activityCount, error: activityError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (activityError) throw activityError;

      // Fetch top competencies
      const { data: jdCompetencies, error: compError } = await supabase
        .from('jd_competencies')
        .select('competency_id, competency:competencies(name)');

      if (compError) throw compError;

      const compCounts = jdCompetencies?.reduce((acc: Record<string, number>, jc: any) => {
        const compName = jc.competency?.name || 'Unknown';
        acc[compName] = (acc[compName] || 0) + 1;
        return acc;
      }, {});

      const topCompetencies = Object.entries(compCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalJDs,
        publishedJDs,
        draftJDs,
        totalUsers,
        activeUsers,
        totalDepartments: deptCount || 0,
        totalTeams: teamCount || 0,
        recentActivities: activityCount || 0,
        jdsByDepartment,
        jdsByStatus,
        jdsByDepartmentAndStatus,
        jdsByJobGrade,
        topCompetencies,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchDashboardStats,
  };
};
