import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';
import ErrorPage from '../../../pages/ErrorPage';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      // Wait for auth context to initialize
      if (loading) {
        return;
      }

      if (!currentUser) {
        setRoleLoading(false);
        return;
      }

      try {
        setRoleLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role || 'user';

          if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'super_admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            setError('Page not found or you don\'t have permission to access this area.');
          }
        } else {
          setIsAdmin(false);
          setError('Page not found.');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setError('Page not found.');
      } finally {
        setRoleLoading(false);
      }
    };

    checkAdminRole();
  }, [currentUser, loading]);

  // Handle navigation in useEffect to avoid React warning
  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!currentUser) {
        navigate('/');
      }
    }
  }, [currentUser, loading, roleLoading, navigate]);

  // Show loading while checking auth and role
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show nothing (navigation handled in useEffect)
  if (!currentUser) {
    return null;
  }

  // If user is not admin or there's an error, show error page
  if (!isAdmin || error) {
    return <ErrorPage
      title="Page Not Found"
      message={error || "The page you're looking for doesn't exist or you don't have permission to access it."}
      showLoginButton={false}
    />;
  }

  // If user is admin, render the protected content
  return children;
};

export default AdminProtectedRoute;