import { create } from "zustand";
import { client } from "../lib/axios";
import toast from "react-hot-toast";
import type {
  AuthState,
  loginResponseType,
  RefreshResponseType,
  signupResponseType,
  updateUserResponseType,
} from "../types/auth.type";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const useStoreAuth = create<AuthState>((set, get) => ({
  authUser: null,
  onlineUsers: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  socket: null,

  // manually set user (optional helper)
  setAuthUser: (user) => set({ authUser: user }),

  // check if user session/token is still valid
  checkAuth: async () => {
    try {
      const res = await client.get<RefreshResponseType>("/api/auth/refresh");
      set({ authUser: res.data.user });
      localStorage.setItem("accessToken", res.data.accessToken);
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
      localStorage.setItem("accessToken", "");
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await client.post<signupResponseType>(
        "/api/auth/sign-up",
        data
      );
      toast.success("Account created Successfully");
      localStorage.setItem("accessToken", res.data.accessToken);
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await client.post("/api/auth/logout");
      set({ authUser: null });
      localStorage.setItem("accessToken", "");
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  },
  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await client.post<loginResponseType>(
        "/api/auth/login",
        formData
      );
      toast.success("Logged In Successfully");
      localStorage.setItem("accessToken", res.data.accessToken);
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await client.put<updateUserResponseType>(
        "/api/auth/update-profile",
        data
      );
      set({ authUser: res.data.user });
      toast.success("Account updated Successfully");
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
