import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';
import {
  createUserProfile,
  ensureUserHasId
} from '../features/users/services/userService';
import {
  getUserMembership,
  checkMembershipExpiry,
  isMembershipExpired,
  addMembershipLog
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
  const [roleError, setRoleError] = useState(null);
  // Use Ref to track initialization within the closure
  const initialLoadComplete = useRef(false);
  const backendInitDone = useRef(false);
  const backendInitInFlight = useRef(false);
  const backendInitAttempt = useRef(0);
  const backendInitRetryTimer = useRef(null);
  const backendInitUserId = useRef(null);
  const tokenCheckInFlight = useRef(false);

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

    const clearBackendInitRetry = () => {
      if (backendInitRetryTimer.current) {
        clearTimeout(backendInitRetryTimer.current);
        backendInitRetryTimer.current = null;
      }
    };

    const callBackendInit = async (authUser) => {
      if (!authUser) return;

      if (backendInitUserId.current !== authUser.uid) {
        backendInitUserId.current = authUser.uid;
        backendInitDone.current = false;
        backendInitInFlight.current = false;
        backendInitAttempt.current = 0;
        clearBackendInitRetry();
      }

      if (backendInitDone.current || backendInitInFlight.current) return;
      backendInitInFlight.current = true;
      backendInitAttempt.current += 1;

      try {
        const token = await authUser.getIdToken();
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/users/init`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        backendInitDone.current = true;
        clearBackendInitRetry();
      } catch (initErr) {
        console.warn('[AuthContext] Backend init call failed, will retry:', initErr);
        const cappedAttempt = Math.min(backendInitAttempt.current, 5);
        const delayMs = Math.min(1000 * (2 ** cappedAttempt), 15000);
        clearBackendInitRetry();
        backendInitRetryTimer.current = setTimeout(() => {
          callBackendInit(authUser);
        }, delayMs);
      } finally {
        backendInitInFlight.current = false;
      }
    };

    const attachProfileListener = (authUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (!authUser) {
        backendInitUserId.current = null;
        backendInitDone.current = false;
        backendInitInFlight.current = false;
        backendInitAttempt.current = 0;
        clearBackendInitRetry();
        setUserProfile(null);
        setMembership(null);
        setRoleError(null);
        setLoading(false);
        return;
      }

      profileUnsubscribe = onSnapshot(
        doc(db, 'users', authUser.uid),
        async (docSnap) => {
          try {
            if (docSnap.exists()) {
              const userData = docSnap.data();

              if (!userData.uniqueUserId) {
                await ensureUserHasId(authUser.uid);
              }

              const rawMembership = userData.membership || { status: 'inactive' };
              const membershipStatus = isMembershipExpired(rawMembership)
                ? { ...rawMembership, status: 'expired' }
                : rawMembership;

              if (membershipStatus.status === 'expired' && rawMembership.status !== 'expired') {
                console.warn(`[AuthContext] Membership expired for ${authUser.uid}`);
                addMembershipLog(
                  authUser.uid,
                  rawMembership.plan || rawMembership.planName || membershipStatus.plan || 'unknown',
                  'expired'
                ).catch(err => console.warn('[AuthContext] Failed to log membership expiry:', err));
              }

              if (!userData.role) {
                setRoleError(new Error('Role missing in user profile'));
              } else {
                setRoleError(null);
              }

              setUserProfile(userData);
              setMembership(membershipStatus);

              userProfileCache.set(authUser.uid, {
                userProfile: userData,
                membership: membershipStatus,
                timestamp: Date.now()
              });

              callBackendInit(authUser);

              if (!initialLoadComplete.current) {
                checkMembershipExpiry(authUser.uid).catch(console.error);
                initialLoadComplete.current = true;
              }
            } else {
              if (!initialLoadComplete.current) {
                try {
                  await createUserProfile({ uid: authUser.uid, email: authUser.email });
                  initialLoadComplete.current = true;
                } catch (e) {
                  console.error("Error creating profile on snapshot missing:", e);
                  setRoleError(e);
                }
              }
            }
          } catch (snapErr) {
            console.error('[AuthContext] Snapshot handling failed:', snapErr);
            setRoleError(snapErr);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Profile snapshot error:", error);
          setRoleError(error);
          setLoading(false);
        }
      );
    };

    const authUnsubscribe = onIdTokenChanged(
      auth,
      async (authUser) => {
        console.log('[Auth] onIdTokenChanged fired', authUser ? authUser.uid : 'null');
        setLoading(true);
        setUser(authUser);
        if (authUser) {
          try {
            if (!tokenCheckInFlight.current) {
              tokenCheckInFlight.current = true;
              await authUser.getIdToken();
            }
          } catch (tokenErr) {
            console.error('[Auth] Token refresh failed:', tokenErr);
            setRoleError(tokenErr);
            setLoading(false);
            auth.signOut();
            return;
          } finally {
            tokenCheckInFlight.current = false;
          }
        }
        attachProfileListener(authUser);
      },
      (error) => {
        console.error('[Auth] onIdTokenChanged error:', error);
        setRoleError(error);
        setLoading(false);
      }
    );

    const handleUnauthorized = () => {
      console.warn('[Auth] Session expired or unauthorized. Logging out...');
      auth.signOut();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      if (profileUnsubscribe) profileUnsubscribe();
      authUnsubscribe();
      clearBackendInitRetry();
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

  const role = userProfile?.role ?? null;

  const value = React.useMemo(() => ({
    currentUser: user,
    userProfile,
    membership,
    role, // Secure role from backend database
    roleError,
    auth,
    loading,
    refreshUserProfile,
    refreshUserRole: refreshUserProfile, // Alias for backward compatibility
  }), [user, userProfile, membership, role, loading, roleError, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
