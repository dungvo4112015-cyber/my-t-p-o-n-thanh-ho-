import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../services/storage';
import { auth, googleProvider, FirestoreSyncService } from '../services/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  currentUser: User;
  currentRole: Role;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  switchRole: (role: Role, userId?: string) => void;
  login: (email: string) => boolean;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = StorageService.getUsers();
  // Default to Teacher (Thầy An) for instant rich view
  const defaultUser = users.find(u => u.role === 'TEACHER') || users[0];

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem('edusmart_current_user_id');
    if (savedUserId) {
      const found = users.find(u => u.id === savedUserId);
      if (found) return found;
    }
    return defaultUser;
  });

  const [currentRole, setCurrentRole] = useState<Role>(currentUser.role);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        setIsFirebaseConnected(true);
        // Check if user already exists or map from fbUser
        const freshUsers = StorageService.getUsers();
        let matched = freshUsers.find(
          u => u.email.toLowerCase() === fbUser.email?.toLowerCase()
        );

        if (!matched) {
          // Create or link user
          matched = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Người dùng Google',
            email: fbUser.email,
            role: fbUser.email === 'dungvo.4112015@gmail.com' ? 'ADMIN' : 'TEACHER',
            avatar:
              fbUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };
          StorageService.addUser(matched);
        }

        setCurrentUser(matched);
        setCurrentRole(matched.role);

        // Sync user profile to Firestore
        try {
          await FirestoreSyncService.saveDoc('users', matched.id, {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            lastLoginAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Could not sync user to Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('edusmart_current_user_id', currentUser.id);
    setCurrentRole(currentUser.role);
  }, [currentUser]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Firebase Google login error:', error);
      throw error;
    }
  };

  const switchRole = (role: Role, userId?: string) => {
    const freshUsers = StorageService.getUsers();
    let targetUser: User | undefined;

    if (userId) {
      targetUser = freshUsers.find(u => u.id === userId);
    } else {
      targetUser = freshUsers.find(u => u.role === role);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentRole(targetUser.role);
      StorageService.addAuditLog({
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        action: 'auth.switch_role',
        module: 'Hệ thống',
        targetName: `Chuyển sang vai trò ${role}`,
        details: `Người dùng chuyển phiên làm việc sang vai trò [${role}] với ID: ${targetUser.id}`,
        ipAddress: '127.0.0.1 (Local Session)',
      });
    }
  };

  const login = (email: string): boolean => {
    const freshUsers = StorageService.getUsers();
    const user = freshUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.status === 'ACTIVE') {
      setCurrentUser(user);
      setCurrentRole(user.role);
      StorageService.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'auth.login',
        module: 'Xác thực',
        targetName: user.name,
        details: `Đăng nhập thành công với vai trò ${user.role}`,
        ipAddress: '127.0.0.1 (Local Session)',
      });
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setFirebaseUser(null);
    switchRole('TEACHER');
  };

  const hasPermission = (module: string, action: string): boolean => {
    // Admin has superuser power
    if (currentRole === 'ADMIN') return true;

    // RBAC rules:
    if (currentRole === 'TEACHER') {
      if (module === 'system_settings' || module === 'audit_logs') return false;
      return true;
    }

    if (currentRole === 'STUDENT') {
      if (
        [
          'assignments.view',
          'assignments.submit',
          'quizzes.take',
          'grades.view',
          'attendance.view',
          'resources.view',
          'rewards.view',
        ].includes(`${module}.${action}`)
      ) {
        return true;
      }
      return false;
    }

    if (currentRole === 'PARENT') {
      if (
        [
          'children.view',
          'grades.view',
          'attendance.view',
          'messages.send',
          'leave_request.create',
        ].includes(`${module}.${action}`)
      ) {
        return true;
      }
      return false;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        firebaseUser,
        isFirebaseConnected,
        loginWithGoogle,
        switchRole,
        login,
        logout,
        hasPermission,
        allUsers: users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
