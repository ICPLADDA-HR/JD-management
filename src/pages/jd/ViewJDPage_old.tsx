import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJobDescriptions } from '../../hooks/useJobDescriptions';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  ArrowLeft,
  Edit2,
  Archive,
  CheckCircle,
  FileText,
  Download,
  Trash2,
  Printer,
  History,
} from 'lucide-react';
import type { JobDescription, JDStatus } from '../../types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { exportJDToPDF } from '../../utils/pdfExport';
import toast from 'react-hot-toast';

export const ViewJDPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getJobDescription, updateStatus, deleteJobDescription } = useJobDescriptions();

  const [jd, setJd] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    loadJobDescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadJobDescription = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getJobDescription(id);
      setJd(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: JDStatus) => {
    if (!jd || !user) return;
    try {
      await updateStatus(jd.id, newStatus, user.id);
      await loadJobDescription();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!jd) return;
    setSubmitting(true);
    try {
      await deleteJobDescription(jd.id);
      navigate('/jd');
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    if (!jd) return;
    try {
      exportJDToPDF(jd);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const getStatusBadge = (status: JDStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-600',
      published: 'bg-green-100 text-green-600',
      archived: 'bg-yellow-100 text-yellow-600',
    };

    const icons = {
      draft: <FileText className="w-3 h-3" />,
      published: <CheckCircle className="w-3 h-3" />,
      archived: <Archive className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskLevelBadge = (level: number) => {
    const styles = {
      1: 'bg-green-100 text-green-600',
      2: 'bg-blue-100 text-blue-600',
      3: 'bg-yellow-100 text-yellow-600',
      4: 'bg-orange-100 text-orange-600',
      5: 'bg-red-100 text-red-600',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-caption font-medium ${styles[level as keyof typeof styles] || styles[3]}`}>
        Level {level}
      </span>
    );
  };

  const getRiskTypeBadge = (type: string) => {
    const styles = {
      safety: 'bg-red-50 text-red-600 border-red-200',
      operational: 'bg-blue-50 text-blue-600 border-blue-200',
      financial: 'bg-green-50 text-green-600 border-green-200',
      reputational: 'bg-purple-50 text-purple-600 border-purple-200',
      compliance: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-caption font-medium border ${styles[type as keyof typeof styles] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  // Prepare radar chart data
  const radarData = jd?.jd_competencies?.map((jdComp: any) => ({
    competency: jdComp.competency?.name || 'Unknown',
    score: jdComp.score,
    fullMark: 5,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!jd) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <p className="text-body text-primary-400 mb-4">Job description not found.</p>
        <Link to="/jd">
          <Button icon={<ArrowLeft className="w-5 h-5" />}>
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/jd" className="inline-flex items-center gap-2 text-body text-primary-500 hover:text-primary-600 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-heading-1 font-semibold text-primary-600">
                {jd.position}
              </h1>
              {getStatusBadge(jd.status)}
            </div>
            <p className="text-body text-primary-400">
              Version {jd.version} • Last updated {new Date(jd.updated_at || jd.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportPDF}
              icon={<Download className="w-5 h-5" />}
            >
              Export PDF
            </Button>

            {canEdit && jd.status !== 'archived' && (
              <>
                <Link to={`/jd/${jd.id}/edit`}>
                  <Button
                    variant="secondary"
                    icon={<Edit2 className="w-5 h-5" />}
                  >
                    Edit
                  </Button>
                </Link>

                {jd.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange('published')}
                    icon={<CheckCircle className="w-5 h-5" />}
                  >
                    Publish
                  </Button>
                )}

                {jd.status === 'published' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange('archived')}
                    icon={<Archive className="w-5 h-5" />}
                  >
                    Archive
                  </Button>
                )}
              </>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(true)}
                icon={<Trash2 className="w-5 h-5" />}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-primary-400 mb-1">Position</p>
                <p className="text-body font-medium text-primary-600">{jd.position}</p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Band / Grade</p>
                <p className="text-body font-medium text-primary-600">{jd.job_band} / {jd.job_grade}</p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Location</p>
                <p className="text-body font-medium text-primary-600">{jd.location?.name}</p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Department</p>
                <p className="text-body font-medium text-primary-600">{jd.department?.name}</p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Team</p>
                <p className="text-body font-medium text-primary-600">{jd.team?.name}</p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Direct Supervisor</p>
                <p className="text-body font-medium text-primary-600">{jd.direct_supervisor}</p>
              </div>
            </div>
          </div>

          {/* Job Purpose */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Job Purpose
            </h2>
            <p className="text-body text-primary-500 whitespace-pre-wrap">
              {jd.job_purpose}
            </p>
          </div>

          {/* Responsibilities */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Key Responsibilities
            </h2>
            <div className="space-y-4">
              {jd.responsibilities?.map((resp: any, index: number) => (
                <div key={resp.id || index} className="border-l-4 border-accent-500 pl-4">
                  <p className="text-caption font-medium text-accent-600 mb-1">
                    {resp.category}
                  </p>
                  <p className="text-body text-primary-500">
                    {resp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Risks & Mitigations
            </h2>
            <div className="space-y-4">
              {jd.risks?.map((risk: any, index: number) => (
                <div key={risk.id || index} className="bg-white/40 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-body font-medium text-primary-600 flex-1">
                      {risk.description}
                    </p>
                    <div className="flex items-center gap-2 ml-4">
                      {getRiskTypeBadge(risk.type)}
                      {getRiskLevelBadge(risk.level)}
                    </div>
                  </div>
                  {risk.mitigation && (
                    <div className="bg-primary-50/50 rounded-lg p-3 mt-2">
                      <p className="text-caption font-medium text-primary-600 mb-1">Mitigation</p>
                      <p className="text-body-sm text-primary-500">{risk.mitigation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Competency Radar Chart */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Competency Profile
            </h2>
            {radarData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis
                      dataKey="competency"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#007AFF"
                      fill="#007AFF"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '8px 12px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-body-sm text-primary-400 text-center py-8">
                No competencies defined
              </p>
            )}
          </div>

          {/* Competency List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Required Competencies
            </h2>
            <div className="space-y-3">
              {jd.jd_competencies?.map((jdComp: any, index: number) => {
                const score = jdComp.score;
                const getScoreColor = (s: number) => {
                  if (s <= 2) return 'text-red-600 bg-red-50';
                  if (s === 3) return 'text-yellow-600 bg-yellow-50';
                  return 'text-green-600 bg-green-50';
                };

                return (
                  <div
                    key={jdComp.id || index}
                    className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-primary-100"
                  >
                    <span className="text-body-sm font-medium text-primary-600">
                      {jdComp.competency?.name}
                    </span>
                    <span className={`text-body-sm font-semibold px-3 py-1 rounded-lg ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Metadata
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-caption text-primary-400 mb-1">Created By</p>
                <p className="text-body-sm font-medium text-primary-600">
                  {jd.created_by_user?.full_name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-caption text-primary-400 mb-1">Created At</p>
                <p className="text-body-sm font-medium text-primary-600">
                  {new Date(jd.created_at).toLocaleString()}
                </p>
              </div>
              {jd.updated_at && jd.updated_at !== jd.created_at && (
                <div>
                  <p className="text-caption text-primary-400 mb-1">Last Updated</p>
                  <p className="text-body-sm font-medium text-primary-600">
                    {new Date(jd.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-caption text-primary-400 mb-1">Version</p>
                <p className="text-body-sm font-medium text-primary-600">
                  v{jd.version}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Job Description"
        message={`Are you sure you want to delete "${jd.position}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        danger
        loading={submitting}
      />
    </div>
  );
};