import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUserRole } from '../../users/services/userService';

const DebugUserRole = () => {
  const { user, userProfile } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('DebugUserRole: Fetching role for user ID:', user.uid);
        const userRole = await getUserRole(user.uid);
        console.log('DebugUserRole: Fetched role:', userRole);
        setRole(userRole);
      } catch (err) {
        console.error('DebugUserRole: Error fetching role:', err);
        setError(err.message);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Debug User Role</h3>
        <p>No user authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
      <h3 className="font-bold">Debug User Role</h3>
      <p>User ID: {user.uid}</p>
      <p>User Email: {user.email}</p>
      <p>User Profile Role: {userProfile?.role || 'Not set'}</p>
      <p>Fetched Role: {loading ? 'Loading...' : (role || 'None')}</p>
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
};

export default DebugUserRole;