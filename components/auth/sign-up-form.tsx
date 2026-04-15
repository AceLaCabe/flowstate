// components/auth/sign-up-form.tsx
"use client";

import { useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length === 0) {
    return {
      label: "",
      width: "0%",
      barClass: "bg-transparent",
      textClass: "text-black/50",
    };
  }

  if (score <= 2) {
    return {
      label: "Weak",
      width: "33%",
      barClass: "bg-red-500",
      textClass: "text-red-600",
    };
  }

  if (score <= 4) {
    return {
      label: "Moderate",
      width: "66%",
      barClass: "bg-yellow-500",
      textClass: "text-yellow-700",
    };
  }

  return {
    label: "Strong",
    width: "100%",
    barClass: "bg-green-600",
    textClass: "text-green-700",
  };
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedFirstName) {
        throw new Error("Please enter your first name.");
      }

      if (!trimmedLastName) {
        throw new Error("Please enter your last name.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
          },
        },
      });

      console.log("SIGNUP RESPONSE:", { data, error });

      if (error) throw error;

      const userId = data.user?.id;

      if (!userId) {
        throw new Error("Account created, but no user ID was returned.");
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
      });

      console.log("PROFILE UPSERT ERROR:", profileError);

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("SIGN UP ERROR:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-black/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Enter your details below to create your Flowstate account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-24"
                    aria-describedby="password-help password-strength"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p id="password-help" className="text-xs text-black/55">
                  Use at least 8 characters with a mix of upper/lowercase, numbers, and symbols.
                </p>

                <div className="space-y-2" aria-live="polite">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        strength.barClass
                      )}
                      style={{ width: strength.width }}
                    />
                  </div>

                  <p
                    id="password-strength"
                    className={cn("text-xs font-medium", strength.textClass)}
                  >
                    {strength.label
                      ? `Password strength: ${strength.label}`
                      : "Password strength"}
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}