import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
    alternativePermission?: string;
    requiredRole?: string[];
}

/**
 * ProtectedRoute component - Protects routes based on permissions and roles
 * 
 * Usage:
 * <ProtectedRoute requiredPermission="ManageStudents">
 *   <StudentsPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
    children,
    requiredPermission,
    alternativePermission,
    requiredRole
}: ProtectedRouteProps) => {
    const currentUser = authService.getCurrentUser();

    // If not authenticated, redirect to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (requiredRole && requiredRole.length > 0) {
        if (!requiredRole.includes(currentUser.userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Check permission if specified
    if (requiredPermission) {
        const userPermissions = currentUser.permissions || [];
        const hasPrimaryPermission = userPermissions.includes(requiredPermission);
        const hasAlternativePermission = alternativePermission
            ? userPermissions.includes(alternativePermission)
            : false;

        if (!hasPrimaryPermission && !hasAlternativePermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // All checks passed, render the children
    return <>{children}</>;
};

export default ProtectedRoute;