// components/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useStoreAuth } from "../store/useStoreAuth";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoutes({ children }: PublicRouteProps) {
  const { authUser } = useStoreAuth();

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}