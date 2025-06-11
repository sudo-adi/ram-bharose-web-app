"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Mock credentials with roles
const MOCK_CREDENTIALS = [
  {
    email: "admin@kmmms.org",
    password: "admin123",
    role: "admin",
    name: "Admin",
  },
  {
    email: "president@kmmms.org",
    password: "president123",
    role: "president",
    name: "President",
  },
  {
    email: "editor@kmmms.org",
    password: "editor123",
    role: "editor",
    name: "Editor",
  },
];

interface UserSession {
  email: string;
  role: string;
  name: string;
  loginTime: string;
  token: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const sessionData = localStorage.getItem("kms_user_session");

        if (!sessionData) {
          setCheckingSession(false);
          return;
        }

        const userSession: UserSession = JSON.parse(sessionData);

        // Validate session structure
        if (
          !userSession.email ||
          !userSession.role ||
          !userSession.name ||
          !userSession.token
        ) {
          // Invalid session structure, remove it
          localStorage.removeItem("kms_user_session");
          setCheckingSession(false);
          return;
        }

        // Check if session is expired (24 hours)
        const loginTime = new Date(userSession.loginTime);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          // Session expired, remove it
          localStorage.removeItem("kms_user_session");
          toast.info("Your session has expired. Please login again.");
          setCheckingSession(false);
          return;
        }

        // Valid session found, redirect to dashboard
        toast.success(`Welcome back, ${userSession.name}!`);
        router.push("/dashboard");
      } catch (error) {
        console.error("Error checking session:", error);
        // Remove corrupted session data
        localStorage.removeItem("kms_user_session");
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find matching credentials
      const user = MOCK_CREDENTIALS.find(
        (cred) =>
          cred.email === formData.email && cred.password === formData.password
      );

      if (user) {
        // Successful login - save user info to localStorage
        const userSession: UserSession = {
          email: user.email,
          role: user.role,
          name: user.name,
          loginTime: new Date().toISOString(),
          token: `kms_${user.role}_${Date.now()}`, // Simple token generation
        };

        localStorage.setItem("kms_user_session", JSON.stringify(userSession));

        toast.success(`Welcome ${user.name}!`);
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking for existing session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome to KMS</h1>
            <p className="text-muted-foreground">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Don't have an account? Contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
