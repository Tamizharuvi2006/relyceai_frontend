import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRole } from '../features/users/services/userService';

export const useRoleRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPostLoginRedirect = async () => {
      if (!user) return;

      const isAuthPage = ['/login', '/Signup', '/signup'].includes(location.pathname);
      if (!isAuthPage) return;

    try {
        const role = await getUserRole(user.uid);
        if (role === 'admin') navigate('/super');
        else if (role === 'superadmin') navigate('/boss');
        else navigate('/chat');
      } catch (err) {
        console.error('[useRoleRedirect] Failed to resolve role during redirect:', err);
        navigate('/error');
      }
    };

    checkPostLoginRedirect();
  }, [user, navigate, location.pathname]);
};

export default useRoleRedirect;
