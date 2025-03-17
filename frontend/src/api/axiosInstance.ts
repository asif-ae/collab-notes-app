import axios, { AxiosInstance } from "axios";

export const API: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5013/api",
  withCredentials: true, // ✅ Always send cookies
});

export default API;
