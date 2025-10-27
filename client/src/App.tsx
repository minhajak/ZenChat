// App.tsx
import { Route, Routes } from "react-router-dom";
import {
  FriendsPage,
  HomePage,
  LoginPage,
  ProfilePage,
  SignaupPage,
  ThemePage,
  UserProfilePage,
} from "./pages";
import { useStoreAuth } from "./store/useStoreAuth";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./layouts/Navbar";
import { useThemeStore } from "./store/useThemeStore";
import SideLayout from "./layouts/SideLayout";
import ProtectedRoutes from "./Routes/ProtectedRoutes";
import PublicRoutes from "./Routes/PublicRoutes";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useStoreAuth();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Routes>
        <Route element={<Navbar />}>
          {/* Protected Routes with Sidebar Layout */}
          <Route
            element={
              <ProtectedRoutes>
                <SideLayout />
              </ProtectedRoutes>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
          </Route>

          {/* Protected Routes without Sidebar */}
          <Route
            path="/friends"
            element={
              <ProtectedRoutes>
                <FriendsPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <ProfilePage />
              </ProtectedRoutes>
            }
          />
          <Route path="/theme" element={<ThemePage />} />

          {/* Public Routes (redirect to home if authenticated) */}
          <Route
            path="/signup"
            element={
              <PublicRoutes>
                <SignaupPage />
              </PublicRoutes>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoutes>
                <LoginPage />
              </PublicRoutes>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}
