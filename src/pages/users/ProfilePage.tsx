import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, MapPin, Building2, Users, Lock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cast user to any to access relations from Supabase
  const userWithRelations = user as any;

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 font-semibold text-primary-600">My Profile</h1>
        <p className="text-body text-primary-400 mt-2">
          View and manage your account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mb-4 shadow-apple">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-body-lg font-semibold text-primary-600 mb-1">
                {userWithRelations.full_name}
              </h2>
              <p className="text-body-sm text-primary-400 mb-3">{userWithRelations.email}</p>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-body-sm font-medium ${
                  userWithRelations.role === 'admin'
                    ? 'bg-red-100 text-red-600'
                    : userWithRelations.role === 'manager'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {userWithRelations.role.charAt(0).toUpperCase() + userWithRelations.role.slice(1)}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-primary-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-body-sm text-primary-500">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>{userWithRelations.location?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-body-sm text-primary-500">
                  <Building2 className="w-4 h-4 text-primary-400" />
                  <span>{userWithRelations.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-body-sm text-primary-500">
                  <Users className="w-4 h-4 text-primary-400" />
                  <span>{userWithRelations.team?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-body-lg font-semibold text-primary-600">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <User className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.full_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <Mail className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Location
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.location?.name || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Role
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <Lock className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.role.charAt(0).toUpperCase() + userWithRelations.role.slice(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary-50/50 rounded-xl">
              <p className="text-body-sm text-primary-500">
                <strong>Note:</strong> To update your personal information, please contact your
                administrator.
              </p>
            </div>
          </div>

          {/* Organization Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-6">
              Organization Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Department
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <Building2 className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.department?.name || 'Not assigned'}</span>
                </div>
              </div>

              <div>
                <label className="block text-caption font-medium text-primary-400 mb-2">
                  Team
                </label>
                <div className="flex items-center gap-3 text-body text-primary-600">
                  <Users className="w-5 h-5 text-primary-400" />
                  <span>{userWithRelations.team?.name || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-body-lg font-semibold text-primary-600">
                  Security Settings
                </h2>
                <p className="text-body-sm text-primary-400 mt-1">
                  Manage your password and security preferences
                </p>
              </div>
              {!showPasswordChange && (
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordChange(true)}
                  icon={<Lock className="w-5 h-5" />}
                >
                  Change Password
                </Button>
              )}
            </div>

            {showPasswordChange ? (
              <div className="space-y-4">
                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    loading={submitting}
                    icon={<Save className="w-5 h-5" />}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-primary-50/50 rounded-xl">
                <p className="text-body-sm text-primary-500">
                  Your password is encrypted and secure. Click "Change Password" to update it.
                </p>
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-primary-100 p-6">
            <h2 className="text-body-lg font-semibold text-primary-600 mb-4">
              Account Status
            </h2>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-body-sm font-medium text-green-900">Active Account</p>
                  <p className="text-caption text-green-700">
                    Your account is active and in good standing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};