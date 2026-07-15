"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(1, "Name is required"),
});

// The sign-up schema is a strict superset of the sign-in schema (same two
// fields plus `name`), so it's safe to type the form as the superset shape
// and switch only the *runtime* validator based on mode. This is the
// standard way to type react-hook-form + zod when one form serves two
// closely related schemas without duplicating the whole component.
type FormValues = z.infer<typeof signUpSchema>;

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const schema = mode === "sign-up" ? signUpSchema : signInSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              email: values.email,
              password: values.password,
              name: values.name,
            })
          : await authClient.signIn.email({ email: values.email, password: values.password });

      if (result.error) {
        toast.error(result.error.message ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="shadow-glass-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          {mode === "sign-up" ? "Create your account" : "Welcome back"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {mode === "sign-up"
            ? "Start tracking every tool you pay for."
            : "Sign in to your asset dashboard."}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "sign-up" ? "Create account" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
