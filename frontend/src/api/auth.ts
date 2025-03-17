import API from "./axiosInstance";

// Types for requests and responses
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

// Signup API
export const signup = async (
  data: SignupData
): Promise<{ message: string }> => {
  const res = await API.post("/auth/signup", data);
  return res.data;
};

// Login API
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// Logout API
export const logout = async (): Promise<{ message: string }> => {
  const res = await API.post("/auth/logout");
  return res.data;
};

// Refresh Token API
export const refreshToken = async (): Promise<{ message: string }> => {
  const res = await API.post("/auth/refresh-token");
  return res.data;
};

// ME API
export const me = async (): Promise<User> => {
  const res = await API.get("/auth/me");
  return res.data;
};
