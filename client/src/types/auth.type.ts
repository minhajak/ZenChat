export type userType = {
  id: string;
  email: string;
  fullName: string;
  password?: string;
  role: string;
  profileImage?: string | File | null;
  createdAt?: string;
};
export type loginResponseType = {
  message: string;
  accessToken: string;
  user: Pick<userType, "id" | "email" | "fullName" | "role" | "profileImage">;
};
export type signupResponseType = {
  message: string;
  accessToken: string;
  user: Pick<userType, "id" | "email" | "fullName" | "role" | "profileImage">;
};

export type updateUserResponseType = {
  user: Pick<
    userType,
    "id" | "email" | "fullName" | "profileImage" | "createdAt" | "role"
  >;
};
export type RefreshResponseType = {
  message: string;
  accessToken: string;
  user: Pick<
    userType,
    "id" | "email" | "fullName" | "profileImage" | "createdAt" | "role"
  >;
};
export interface AuthState {
  authUser: userType | null;
  onlineUsers: string[] | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  isUpdatingProfile: boolean;
  socket: any;
  checkAuth: () => Promise<void>;
  setAuthUser: (user: any | null) => void;
  signup: (user: Pick<userType, "email" | "fullName" | "password">) => void;
  logout: () => void;
  login: (formData: Pick<userType, "email" | "password">) => void;
  updateProfile: (data: FormData) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}