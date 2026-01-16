import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserRole } from '../features/users/services/userService';

const useUserRole = () => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!currentUser) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
      } catch (err) {
        setError(err.message);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [currentUser]);

  const hasRole = (requiredRole) => {
    if (!userRole) return false;
    const roleHierarchy = { 'user': 1, 'premium': 2, 'admin': 3, 'superadmin': 4 };
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  };

  const isAdmin = () => hasRole('admin');
  const isSuperAdmin = () => userRole === 'superadmin';

  return {
    userRole, isLoading, error,
    hasRole, isAdmin, isSuperAdmin,
    isAuthenticated: !!currentUser
  };
};

export default useUserRole;