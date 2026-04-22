// components/auth/forgot-password-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-black/10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              Password reset instructions sent
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-sm leading-6 text-muted-foreground">
              If you registered using email and password, you’ll receive a reset
              link shortly.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">Back to Login</Button>
              </Link>

              <Link href="/" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-black/15 bg-white hover:bg-black/5"
                >
                  Return Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-black/10 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>

            <CardDescription>
              Enter your email and we&apos;ll send you a secure reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset email"}
                </Button>
              </div>

              <div className="mt-4 flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center">
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Back to Login
                </Link>

                <span className="hidden sm:inline text-black/30">•</span>

                <Link
                  href="/"
                  className="underline underline-offset-4"
                >
                  Home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}