"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import Firebase services from firebase-config.js
import { auth, db, rtdb } from "@/firebase-config";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const fullName = `${firstName} ${lastName}`;

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email: email,
      });

      // Save user info to Realtime Database
      await set(ref(rtdb, `users/${user.uid}`), {
        name: fullName,
        email: email,
      });

      // Redirect to home page after successful sign-up
      router.push("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message);
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
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your information to get started with HealthMate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm sm:text-base">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm sm:text-base">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>
          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-4 sm:p-6 pt-0">
          <Button onClick={handleSignup} className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base">
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-center text-xs sm:text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
