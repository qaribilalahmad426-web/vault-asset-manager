import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-4">
      <AuthForm mode="sign-up" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
