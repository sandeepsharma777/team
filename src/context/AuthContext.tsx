import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { Profile, UserRole } from '../types';
import { db } from '../services/db';
import { withTimeout } from '../services/firebaseDb';

interface AuthContextType {
  currentProfile: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  allProfiles: Profile[];
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (
    data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
    password?: string
  ) => Promise<Profile>;
  logout: () => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loadAllProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'teamsync_active_user_id';

export const ADMIN_EMAILS = [
  'sandeepsharma92241@gmail.com',
  'admin@teamsync.edu',
];

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isLoggingOutRef = useRef<boolean>(false);

  const loadAllProfiles = async (): Promise<void> => {
    try {
      const profiles = await db.getProfiles();
      setAllProfiles(profiles);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  // Sync profile data given an email or user ID
  const syncOrCreateProfileForUser = async (
    firebaseUser: FirebaseUser,
    extraData?: Partial<Profile>
  ): Promise<Profile | null> => {
    const email = (firebaseUser.email || '').trim().toLowerCase();
    if (!email) return null;

    const isAdmin = isAdminEmail(email) || extraData?.role === 'admin';

    // Check if profile exists by ID or Email
    let profile = await db.getProfileById(firebaseUser.uid);
    if (!profile) {
      profile = await db.getProfileByEmail(email);
    }

    if (profile) {
      // If user is an admin email but stored as student, promote to admin
      if (isAdmin && profile.role !== 'admin') {
        const updated = await db.updateProfile(profile.id, { role: 'admin' });
        if (updated) profile = { ...profile, role: 'admin' };
      } else if (!isAdmin && profile.role === 'admin') {
        const updated = await db.updateProfile(profile.id, { role: 'student' });
        if (updated) profile = { ...profile, role: 'student' };
      }
    } else {
      // Auto-provision a new profile in Firestore / Database
      const displayName =
        extraData?.full_name ||
        firebaseUser.displayName ||
        email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
          .join(' ')
          .trim() ||
        (isAdmin ? 'System Administrator' : 'Student Builder');

      profile = await db.createProfile({
        id: firebaseUser.uid,
        email,
        full_name: displayName,
        college_name: extraData?.college_name || 'Stanford University',
        year_of_study: extraData?.year_of_study || '4th Year',
        branch: extraData?.branch || 'Computer Science & Engineering',
        bio:
          extraData?.bio ||
          (isAdmin
            ? 'Administrator for TeamSync. Managing hackathons, campus opportunities, and builder communities.'
            : 'Student builder excited to collaborate on hackathons and projects.'),
        skills: extraData?.skills || ['React', 'TypeScript', 'Node.js', 'System Architecture'],
        interests: extraData?.interests || ['Hackathons', 'Open Source', 'Web3 & AI', 'Platform Admin'],
        github_url: extraData?.github_url || '',
        linkedin_url: extraData?.linkedin_url || '',
        portfolio_url: extraData?.portfolio_url || '',
        is_open_to_teams: true,
        role: isAdmin ? 'admin' : 'student',
      });
    }

    return profile;
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      setIsLoading(true);
      try {
        db.seedInitialDataIfEmpty().catch((e) => console.warn('Seed notice:', e));
        loadAllProfiles().catch((e) => console.warn('Load profiles notice:', e));

        if (isFirebaseConfigured && auth) {
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              try {
                const profile = await syncOrCreateProfileForUser(user);
                if (profile) {
                  setCurrentProfile(profile);
                  localStorage.setItem(LOCAL_STORAGE_KEY, profile.id);
                }
              } catch (err) {
                console.warn('Error loading profile for Firebase user:', err);
              }
            } else {
              // Firebase logged out or not logged in yet
              if (isLoggingOutRef.current) {
                setCurrentProfile(null);
              } else {
                const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedUserId) {
                  const found = await db.getProfileById(savedUserId);
                  if (found) {
                    setCurrentProfile(found);
                  } else {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    setCurrentProfile(null);
                  }
                } else {
                  setCurrentProfile(null);
                }
              }
            }
            setIsLoading(false);
          });
        } else {
          // Local fallback initialization
          const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedUserId) {
            const found = await db.getProfileById(savedUserId);
            if (found) {
              setCurrentProfile(found);
            }
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g., student@college.edu).');
    }

    // 1. Try Firebase Authentication if configured and password is provided
    if (isFirebaseConfigured && auth && password) {
      try {
        const userCred = await withTimeout(
          signInWithEmailAndPassword(auth, cleanEmail, password),
          6000
        );
        const profile = await syncOrCreateProfileForUser(userCred.user);
        if (profile) {
          setCurrentProfile(profile);
          localStorage.setItem(LOCAL_STORAGE_KEY, profile.id);
          loadAllProfiles().catch(() => {});
          return true;
        }
      } catch (fbErr: any) {
        // Handle common Firebase Auth error codes
        if (
          fbErr.code === 'auth/invalid-credential' ||
          fbErr.code === 'auth/wrong-password' ||
          fbErr.code === 'auth/invalid-login-credentials'
        ) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (fbErr.code === 'auth/user-not-found') {
          throw new Error('No account found for this email. Please switch to Create New Profile.');
        } else if (fbErr.code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again later.');
        } else if (fbErr.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else {
          throw new Error(fbErr.message || 'Authentication failed. Please check your credentials.');
        }
      }
    }

    // 2. Database lookup fallback (only for local/dev mode without Firebase Auth or passwordless lookup)
    if (!isFirebaseConfigured || !auth || !password) {
      let profile = await db.getProfileByEmail(cleanEmail);
      if (!profile) {
        // Auto-provision
        const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart
          .split(' ')
          .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
          .join(' ')
          .trim();

        const isAdmin = isAdminEmail(cleanEmail);
        profile = await db.createProfile({
          email: cleanEmail,
          full_name: formattedName || (isAdmin ? 'System Administrator' : 'Student Builder'),
          college_name: 'Stanford University',
          year_of_study: '4th Year',
          branch: 'Computer Science & Engineering',
          bio: isAdmin
            ? 'Administrator for TeamSync. Managing hackathons, campus opportunities, and builder communities.'
            : 'Passionate student builder excited to collaborate on projects and hackathons.',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Python'],
          interests: ['Hackathons', 'Project Building', 'Open Source'],
          is_open_to_teams: true,
          role: isAdmin ? 'admin' : 'student',
        });
      }

      if (profile) {
        if (isAdminEmail(cleanEmail) && profile.role !== 'admin') {
          const updated = await db.updateProfile(profile.id, { role: 'admin' });
          if (updated) profile = { ...profile, role: 'admin' };
        } else if (!isAdminEmail(cleanEmail) && profile.role === 'admin') {
          const updated = await db.updateProfile(profile.id, { role: 'student' });
          if (updated) profile = { ...profile, role: 'student' };
        }
        setCurrentProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_KEY, profile.id);
        loadAllProfiles().catch(() => {});
        return true;
      }
    }
    return false;
  };

  const signup = async (
    data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
    password?: string
  ): Promise<Profile> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address (e.g., student@college.edu).');
    }

    const isAdmin = isAdminEmail(cleanEmail) || data.role === 'admin';
    let firebaseUid: string | undefined;

    // Check if profile already exists in DB
    const existingProfile = await db.getProfileByEmail(cleanEmail);

    // 1. Create Firebase Auth user if configured and password is provided
    if (isFirebaseConfigured && auth && password) {
      try {
        const userCred = await withTimeout(
          createUserWithEmailAndPassword(auth, cleanEmail, password),
          6000
        );
        firebaseUid = userCred.user.uid;

        if (data.full_name) {
          try {
            await withTimeout(
              updateFirebaseAuthProfile(userCred.user, {
                displayName: data.full_name,
              }),
              3000
            );
          } catch (e) {
            console.warn('Failed to set Firebase displayName:', e);
          }
        }
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-in-use') {
          // If already exists in Firebase Auth, attempt login with entered password
          try {
            const loginCred = await withTimeout(
              signInWithEmailAndPassword(auth, cleanEmail, password),
              5000
            );
            firebaseUid = loginCred.user.uid;
          } catch {
            throw new Error(
              "An account with this email already exists. Please log in instead, or use 'Forgot password' if you don't remember it."
            );
          }
        } else if (fbErr.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters.');
        } else if (fbErr.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (fbErr.code === 'auth/operation-not-allowed') {
          console.warn('Email/Password provider disabled in Firebase console, proceeding with profile registration.');
        } else {
          throw new Error(fbErr.message || 'Signup failed. Please try again.');
        }
      }
    }

    // 2. If a profile already exists for this UID or email, update and sign in seamlessly
    if (firebaseUid) {
      const existingById = await db.getProfileById(firebaseUid);
      if (existingById) {
        const updated = await db.updateProfile(existingById.id, {
          ...data,
          email: cleanEmail,
          role: isAdmin ? 'admin' : data.role || existingById.role || 'student',
        });
        const finalProfile = updated || existingById;
        setCurrentProfile(finalProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, finalProfile.id);
        loadAllProfiles().catch(() => {});
        return finalProfile;
      }
      if (existingProfile) {
        const updated = await db.updateProfile(existingProfile.id, {
          ...data,
          email: cleanEmail,
          role: isAdmin ? 'admin' : data.role || existingProfile.role || 'student',
        });
        const finalProfile = updated || existingProfile;
        setCurrentProfile(finalProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, finalProfile.id);
        loadAllProfiles().catch(() => {});
        return finalProfile;
      }
    }

    // Guard fallback so it only runs when Firebase Auth is not configured or no password was provided
    if (existingProfile && (!isFirebaseConfigured || !auth || !password)) {
      const updated = await db.updateProfile(existingProfile.id, {
        ...data,
        email: cleanEmail,
        role: isAdmin ? 'admin' : data.role || existingProfile.role || 'student',
      });
      const finalProfile = updated || existingProfile;
      setCurrentProfile(finalProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, finalProfile.id);
      loadAllProfiles().catch(() => {});
      return finalProfile;
    }

    // 3. Persist new profile document in database & local cache
    const newProfile = await db.createProfile({
      ...data,
      id: firebaseUid || undefined,
      email: cleanEmail,
      role: isAdmin ? 'admin' : data.role || 'student',
    });

    if (!newProfile) {
      throw new Error('Failed to create student profile.');
    }

    setCurrentProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, newProfile.id);
    loadAllProfiles().catch(() => {});
    return newProfile;
  };

  const logout = async () => {
    isLoggingOutRef.current = true;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCurrentProfile(null);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCurrentProfile(null);
      isLoggingOutRef.current = false;
    }
  };

  const switchProfile = async (profileId: string) => {
    const profile = allProfiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_KEY, profile.id);
    } else {
      const fetched = await db.getProfileById(profileId);
      if (fetched) {
        setCurrentProfile(fetched);
        localStorage.setItem(LOCAL_STORAGE_KEY, fetched.id);
      }
    }
  };

  const refreshProfile = async () => {
    if (!currentProfile) return;
    const updated = await db.getProfileById(currentProfile.id);
    if (updated) {
      setCurrentProfile(updated);
    }
    await loadAllProfiles();
  };

  return (
    <AuthContext.Provider
      value={{
        currentProfile,
        role: currentProfile?.role || 'student',
        isAuthenticated: !!currentProfile,
        isLoading,
        allProfiles,
        login,
        signup,
        logout,
        switchProfile,
        refreshProfile,
        loadAllProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
