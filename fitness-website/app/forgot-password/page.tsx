"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase-config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let errorMessage = "Unable to send reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4">
      <Card className="mx-auto max-w-md w-full border-2 border-primary/20">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {!success ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="fittuber@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-9 text-sm sm:text-base"
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-600">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-2">Check your inbox</h3>
              <p className="text-sm text-green-700">
                We've sent a password reset link to <span className="font-semibold">{email}</span>. Please check your spam folder if you don't see it within a few minutes.
              </p>
              <Button
                variant="outline"
                className="w-full mt-4 text-sm sm:text-base"
                onClick={() => setSuccess(false)}
              >
                Try another email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center p-4 sm:p-6 pt-0 border-t mt-6">
          <Link href="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
