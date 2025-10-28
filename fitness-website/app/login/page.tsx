import Link from "next/link"
import { ArrowRight, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4">
      <Card className="mx-auto max-w-md w-full border-2 border-primary/20">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
            <Input id="email" type="email" placeholder="john.doe@example.com" className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <Link href="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" className="text-sm sm:text-base" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-4 sm:p-6 pt-0">
          <Button className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-center text-xs sm:text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

