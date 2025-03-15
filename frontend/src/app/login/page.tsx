"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login, LoginData } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required"),
});

export default function LoginPage() {
  const { setAccessToken } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    try {
      const { accessToken } = await login(data);
      setAccessToken(accessToken);
      router.push("/");
    } catch (error: unknown) {
      console.error(error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold">Login</h2>
      <input {...register("email")} placeholder="Email" className="input" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <input type="password" {...register("password")} placeholder="Password" className="input" />
      {errors.password && <p className="text-red-500">{errors.password.message}</p>}

      <button type="submit" className="btn-primary">Login</button>
    </form>
  );
}
