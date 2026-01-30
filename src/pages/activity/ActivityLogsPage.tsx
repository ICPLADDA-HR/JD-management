import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { ActivityLog } from '../../types';
import {
  Search,
  FileText,
  Users,
  Settings,
  Shield,
  Activity,
  Clock,
  Eye,
  X,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const ActivityLogsPage = () => {
  const { user: currentUser } = useAuth();
  const { logs, loading, refetch } = useActivityLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page visible - refetching logs...');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const canViewLogs = isAdmin || isManager; // Allow manager to also view

  // Debug: log auth and logs state
  console.warn('=== ActivityLogsPage RENDER ===');
  console.warn('currentUser:', currentUser);
  console.warn('currentUser?.role:', currentUser?.role);
  console.warn('isAdmin:', isAdmin);
  console.warn('isManager:', isManager);
  console.warn('canViewLogs:', canViewLogs);
  console.warn('Total logs:', logs.length);
  logs.forEach((log, i) => {
    console.warn(`Log ${i}: action="${log.action}", hasMetadata=${!!log.metadata}, hasBefore=${!!log.metadata?.before}, hasAfter=${!!log.metadata?.after}`);
  });

  // Check if log has before/after comparison data
  const hasComparisonData = (log: ActivityLog) => {
    return log.metadata?.before && log.metadata?.after;
  };

  // Handle double click to open modal
  const handleDoubleClick = (log: ActivityLog) => {
    setSelectedLog(log);
  };

  // Handle view changes button click
  const handleViewChanges = (log: ActivityLog, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLog(log);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;

    return true;
  });

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: 'bg-green-100 text-green-600',
      update: 'bg-blue-100 text-blue-600',
      delete: 'bg-red-100 text-red-600',
      publish: 'bg-purple-100 text-purple-600',
      archive: 'bg-yellow-100 text-yellow-600',
      role_change: 'bg-orange-100 text-orange-600',
      team_assign: 'bg-cyan-100 text-cyan-600',
      team_remove: 'bg-pink-100 text-pink-600',
      user_delete: 'bg-red-100 text-red-600',
      password_change: 'bg-indigo-100 text-indigo-600',
    };

    const labels: Record<string, string> = {
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      publish: 'Publish',
      archive: 'Archive',
      role_change: 'Role Change',
      team_assign: 'Team Assign',
      team_remove: 'Team Remove',
      user_delete: 'User Delete',
      password_change: 'Password Change',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-caption font-medium ${styles[action] || 'bg-gray-100 text-gray-600'}`}>
        {labels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const icons = {
      job_description: <FileText className="w-4 h-4" />,
      user: <Users className="w-4 h-4" />,
      location: <Settings className="w-4 h-4" />,
      department: <Settings className="w-4 h-4" />,
      team: <Settings className="w-4 h-4" />,
      competency: <Settings className="w-4 h-4" />,
    };

    return icons[entityType as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  const getEntityTypeBadge = (entityType: string) => {
    const labels = {
      job_description: 'Job Description',
      user: 'User',
      location: 'Location',
      department: 'Department',
      team: 'Team',
      competency: 'Competency',
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-medium bg-primary-50 text-primary-600">
        {getEntityIcon(entityType)}
        {labels[entityType as keyof typeof labels] || entityType}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!canViewLogs) {
    console.warn('=== ACCESS DENIED - canViewLogs is false ===');
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <h2 className="text-heading-2 font-semibold text-primary-600 mb-2">Access Denied</h2>
        <p className="text-body text-primary-400">
          You don't have permission to view activity logs.
        </p>
        <p className="text-caption text-primary-300 mt-2">
          Debug: role={currentUser?.role}, canViewLogs={String(canViewLogs)}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 font-semibold text-primary-600">Activity Logs</h1>
          <p className="text-body text-primary-400 mt-2">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'activity' : 'activities'} found
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          loading={isRefreshing}
          icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          รีเฟรช
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
            <Input
              placeholder="Search by user, description, or entity ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="publish">Publish</option>
            <option value="archive">Archive</option>
            <option value="role_change">Role Change</option>
            <option value="team_assign">Team Assign</option>
            <option value="team_remove">Team Remove</option>
            <option value="user_delete">User Delete</option>
          </Select>

          <Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            <option value="all">All Entities</option>
            <option value="job_description">Job Descriptions</option>
            <option value="user">Users</option>
            <option value="location">Locations</option>
            <option value="department">Departments</option>
            <option value="team">Teams</option>
            <option value="competency">Competencies</option>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100">
          <Activity className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-body text-primary-400 mb-4">
            {searchQuery || actionFilter !== 'all' || entityFilter !== 'all'
              ? 'No activities match your filters.'
              : 'No activities found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onDoubleClick={() => handleDoubleClick(log)}
                className="flex items-start gap-4 p-4 bg-white/40 rounded-xl border border-primary-100 hover:bg-white/60 transition-colors cursor-pointer"
              >
                {/* Avatar/Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold text-body-sm shadow-apple">
                  {log.user?.full_name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-body-sm font-semibold text-primary-600">
                          {log.user?.full_name || 'Unknown User'}
                        </span>
                        {getActionBadge(log.action)}
                        {getEntityTypeBadge(log.entity_type)}
                      </div>
                      <p className="text-body text-primary-500 break-words">
                        {log.description}
                      </p>
                      {log.entity_id && (
                        <p className="text-caption text-primary-400 mt-1 font-mono">
                          ID: {log.entity_id}
                        </p>
                      )}
                    </div>

                    {/* View Changes Button - show for update actions */}
                    {log.action === 'update' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleViewChanges(log, e)}
                        icon={<Eye className="w-4 h-4" />}
                        className="flex-shrink-0"
                      >
                        ดูการแก้ไข
                      </Button>
                    )}
                  </div>

                  {/* Metadata Details - simplified for non-update */}
                  {log.metadata && Object.keys(log.metadata).filter(k => k !== 'before' && k !== 'after').length > 0 && (
                    <div className="mt-3 p-3 bg-primary-50/50 rounded-lg">
                      <p className="text-caption font-medium text-primary-600 mb-2">Details:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(log.metadata)
                          .filter(([key]) => key !== 'before' && key !== 'after')
                          .map(([key, value]) => (
                          <div key={key} className="text-caption text-primary-500">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="break-words">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 mt-2 text-caption text-primary-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-200">
              <div>
                <h2 className="text-body-lg font-semibold text-primary-600">รายละเอียดการแก้ไข</h2>
                <p className="text-caption text-primary-400 mt-1">{selectedLog.description}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Basic Info */}
              <div className="mb-6 p-4 bg-primary-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-primary-400">ผู้ทำรายการ</p>
                    <p className="text-body-sm font-medium text-primary-600">
                      {selectedLog.user?.full_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-primary-400">วันที่/เวลา</p>
                    <p className="text-body-sm font-medium text-primary-600">
                      {new Date(selectedLog.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-primary-400">Action</p>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <p className="text-caption text-primary-400">Entity</p>
                    <div className="mt-1">{getEntityTypeBadge(selectedLog.entity_type)}</div>
                  </div>
                </div>
              </div>

              {/* Before/After Comparison */}
              {hasComparisonData(selectedLog) ? (
                <div>
                  <h3 className="text-body font-semibold text-primary-600 mb-4">การเปรียบเทียบข้อมูล</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Before Column */}
                    <div className="bg-red-50 rounded-xl p-4">
                      <h4 className="text-body-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        ก่อนแก้ไข
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(selectedLog.metadata?.before || {}).map(([key, value]) => {
                          const afterValue = selectedLog.metadata?.after?.[key];
                          const isChanged = JSON.stringify(value) !== JSON.stringify(afterValue);
                          return (
                            <div key={key} className={`text-caption ${isChanged ? 'bg-red-100 p-2 rounded-lg' : ''}`}>
                              <span className="font-medium text-primary-600 block">{key}</span>
                              <span className="text-primary-500 break-words">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '-')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                      <ArrowRight className="w-6 h-6 text-primary-400" />
                    </div>

                    {/* After Column */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="text-body-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        หลังแก้ไข
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(selectedLog.metadata?.after || {}).map(([key, value]) => {
                          const beforeValue = selectedLog.metadata?.before?.[key];
                          const isChanged = JSON.stringify(value) !== JSON.stringify(beforeValue);
                          return (
                            <div key={key} className={`text-caption ${isChanged ? 'bg-green-100 p-2 rounded-lg' : ''}`}>
                              <span className="font-medium text-primary-600 block">{key}</span>
                              <span className="text-primary-500 break-words">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '-')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Metadata for non-comparison logs */
                <div>
                  <h3 className="text-body font-semibold text-primary-600 mb-4">รายละเอียดทั้งหมด</h3>
                  <div className="bg-primary-50 rounded-xl p-4">
                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(selectedLog.metadata).map(([key, value]) => (
                          <div key={key} className="text-caption">
                            <span className="font-medium text-primary-600 block">{key}</span>
                            <span className="text-primary-500 break-words">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '-')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-caption text-primary-400">ไม่มีข้อมูลเพิ่มเติม</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-primary-200 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
