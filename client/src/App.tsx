import { Navigate, Route, Routes } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  ProfilePage,
  SettingsPage,
  SignaupPage,
} from "./pages";
import { useStoreAuth } from "./store/useStoreAuth";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./layouts/Navbar";
import { useThemeStore } from "./store/useThemeStore";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useStoreAuth();
  const { theme } = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, []);
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          index
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignaupPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}
