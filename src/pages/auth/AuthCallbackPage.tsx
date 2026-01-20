import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Set the session with the tokens from Microsoft
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) throw error;

          if (data.session) {
            toast.success('เข้าสู่ระบบสำเร็จ!');
            navigate('/dashboard', { replace: true });
          }
        } else {
          throw new Error('No access token found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-yellow-100 to-primary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-primary-600 font-medium">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  );
};
