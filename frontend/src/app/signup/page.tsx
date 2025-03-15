"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup, SignupData } from "@/api/auth";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data: SignupData) => {
    try {
      await signup(data);
      router.push("/login");
    } catch (error: unknown) {
      console.error(error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold">Signup</h2>
      <input {...register("name")} placeholder="Name" className="input" />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <input {...register("email")} placeholder="Email" className="input" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <input type="password" {...register("password")} placeholder="Password" className="input" />
      {errors.password && <p className="text-red-500">{errors.password.message}</p>}

      <button type="submit" className="btn-primary">Signup</button>
    </form>
  );
}
