import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5013/api",
  withCredentials: true, // To send cookies (refreshToken)
});

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
