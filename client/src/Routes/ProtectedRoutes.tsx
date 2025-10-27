// components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useStoreAuth } from "../store/useStoreAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoutes({ children }: ProtectedRouteProps) {
  const { authUser } = useStoreAuth();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

