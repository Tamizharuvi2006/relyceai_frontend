import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';
import {
  createUserProfile,
  updateUserLastLogin,
  assignUserIdToExistingUser,
  ensureUserHasId
} from '../features/users/services/userService';
import {
  getUserMembership,
  checkMembershipExpiry
} from '../features/membership/services/membershipService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Cache for user profiles to prevent repeated fetches
const userProfileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// This is the single, correct AuthProvider component
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  // Use Ref to track initialization within the closure
  const initialLoadComplete = useRef(false);

  const fetchUserProfile = async (uid, skipExpensiveOperations = false) => {
    try {
      // Check cache first, but allow force refresh
      const cacheKey = `${uid}_${skipExpensiveOperations}`;
      const cached = userProfileCache.get(cacheKey);

      // Always fetch fresh data from Firestore, don't rely on cache for critical operations
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Ensure user has a uniqueUserId assigned
        if (!userData.uniqueUserId) {
          const assignedId = await ensureUserHasId(uid);
          if (assignedId) {
            userData.uniqueUserId = assignedId;
          }
        }

        // Only run expensive operations if not skipping
        if (!skipExpensiveOperations) {
          // Check membership expiry (run in background)
          checkMembershipExpiry(uid).catch(console.error);

          // Update last login (run in background)
          updateUserLastLogin(uid).catch(console.error);
        }

        // Get membership data (lightweight operation)
        let membershipData;
        try {
          membershipData = await getUserMembership(uid);
        } catch (err) {
          console.warn('Failed to get membership data:', err);
          membershipData = userData.membership || null;
        }

        // Cache the result
        userProfileCache.set(cacheKey, {
          userProfile: userData,
          membership: membershipData,
          timestamp: Date.now()
        });

        setUserProfile(userData);
        setMembership(membershipData);

        return userData;
      } else {
        // Create new user profile if doesn't exist
        try {
          const newProfile = await createUserProfile({ uid, email: auth.currentUser?.email });
          setUserProfile(newProfile);
          setMembership(newProfile.membership);
          return newProfile;
        } catch (err) {
          console.error('Failed to create user profile:', err);
          return null;
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let profileUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Set user and loading IMMEDIATELY
      setUser(authUser);
      
      // Cleanup previous profile listener if it exists (e.g. user switch)
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (authUser) {
          // Subscribe to real-time updates for the User Profile
          profileUnsubscribe = onSnapshot(doc(db, 'users', authUser.uid), async (docSnap) => {
              if (docSnap.exists()) {
                  const userData = docSnap.data();
                  
                  // Ensure uniqueUserId exists (idempotent check)
                  if (!userData.uniqueUserId) {
                      await ensureUserHasId(authUser.uid);
                      // On snapshot update, we don't need to re-set here, the next snapshot will catch it.
                  }

                  // Update State
                  setUserProfile(userData);
                  setMembership(userData.membership || null);

                  // Update cache
                  userProfileCache.set(authUser.uid, {
                      userProfile: userData,
                      membership: userData.membership || null,
                      timestamp: Date.now()
                  });

                  // Trigger background tasks only once on initial load of this session
                  if (!initialLoadComplete.current) {
                      // FIX: ALWAYS call backend init on login to ensure role, uniqueUserId, and membership are valid
                      // This catches cases where data may have been corrupted or partially written
                      try {
                          const token = await authUser.getIdToken();
                          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                          fetch(`${apiUrl}/users/init`, {
                              method: 'POST',
                              headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                              }
                          }).catch(err => console.warn('[AuthContext] Backend init call failed:', err));
                      } catch (initErr) {
                          console.warn('[AuthContext] Could not call backend init:', initErr);
                      }
                      
                      updateUserLastLogin(authUser.uid).catch(console.error);
                      checkMembershipExpiry(authUser.uid).catch(console.error);
                      initialLoadComplete.current = true;
                  }
              } else {
                   // User doc deleted or doesn't exist? Create profile.
                   // Only try once to avoid loops
                   if (!initialLoadComplete.current) {
                       try {
                           await createUserProfile({ uid: authUser.uid, email: authUser.email });
                           initialLoadComplete.current = true;
                       } catch (e) {
                           console.error("Error creating profile on snapshot missing:", e);
                       }
                   }
              }
              setLoading(false);
          }, (error) => {
              console.error("Profile snapshot error:", error);
              setLoading(false);
          });

      } else {
        setUserProfile(null);
        setMembership(null);
        setLoading(false);
      }
    });

    // Listen for API 401/403 errors to trigger auto-logout
    const handleUnauthorized = () => {
      console.warn('[Auth] Session expired or unauthorized. Logging out...');
      auth.signOut();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Cleanup function
    return () => {
      if (profileUnsubscribe) profileUnsubscribe();
      authUnsubscribe();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []); // Remove dependency on initialLoadComplete to avoid re-subscribing loop

  const refreshUserProfile = async () => {
    if (user) {
      // Clear cache before refreshing to ensure fresh data
      userProfileCache.clear();
      await fetchUserProfile(user.uid, false); // Don't skip expensive operations on manual refresh
    }
  };

  // Get role directly from userProfile - this is now secure as it comes from backend
  const role = userProfile?.role || 'user';

  const value = React.useMemo(() => ({
    currentUser: user,
    userProfile,
    membership,
    role, // Secure role from backend database
    auth,
    loading,
    refreshUserProfile,
    refreshUserRole: refreshUserProfile, // Alias for backward compatibility
  }), [user, userProfile, membership, role, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}