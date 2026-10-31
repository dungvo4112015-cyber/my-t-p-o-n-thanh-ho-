import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { ForbiddenPage } from '../../pages/error/ForbiddenPage';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentRole } = useAuth();

  if (!allowedRoles.includes(currentRole)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};
