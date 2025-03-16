"use client";

import { login, LoginData } from "@/api/auth";
import API from "@/api/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required"),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data); // ✅ Cookies set automatically

      // ✅ Immediately verify cookies by calling refresh token API
      try {
        await API.post("/auth/refresh-token"); // Check token via cookie, Success means cookies are set
        console.log("✅ Tokens verified, redirecting...");
        router.push("/"); // ✅ Redirect to home
      } catch (refreshError) {
        console.error(
          "❌ Tokens not set properly, login failed.",
          refreshError
        );
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto mt-10"
      >
        <h2 className="text-2xl font-bold">Login</h2>

        <input {...register("email")} placeholder="Email" className="input" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="input"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          Login
        </button>
        <Link href="/signup">
          <button type="button" className="btn-primary w-full">
            Sign up
          </button>
        </Link>
      </form>
    </>
  );
}
