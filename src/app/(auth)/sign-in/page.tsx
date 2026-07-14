import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-4">
      <AuthForm mode="sign-in" />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
