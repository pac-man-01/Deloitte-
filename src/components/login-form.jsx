import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import image from "@/assets/cycle.svg";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

export function LoginForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleUrl = queryParams.get("role");

  const navigate = useNavigate();
  const { currentUser, loginUser, loading } = useAuth();

  // ✅ Redirect if already logged in with a role
  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.role === "admin" && roleUrl === "admin") {
        navigate("/admin", { replace: true });
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Welcome Back!",
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: "small-toast",
          },
        });
      } else if (currentUser.role === "employee" && roleUrl === "employee") {
        navigate("/home", { replace: true });
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Welcome Back!",
          showConfirmButton: false,
          timer: 3000,
          customClass: {
            popup: "small-toast",
          },
        });
      }
    }
  }, [loading, currentUser, navigate]);

  // ❌ Invalid role param
  if (roleUrl !== "admin" && roleUrl !== "employee") {
    navigate("/not-authorized", { replace: true });
    return null;
  }

  const onSubmit = async (data) => {
    try {
      data.role = roleUrl;

      await loginUser(data);

      if (roleUrl === "admin") navigate("/admin");
      else if (roleUrl === "employee") navigate("/home");

      await fetch("http://localhost:8000/api/update-learning-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Login successful!",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Login failed!",
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: "small-toast",
        },
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome {roleUrl}</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your E-Learning account
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@deloitte.com"
                  {...register("email", {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-xs text-destructive">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {roleUrl === "admin" && (
                <div className="grid gap-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    {...register("password", {
                      required: "Password is required for admin",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      maxLength: {
                        value: 20,
                        message: "Password cannot exceed 20 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <span className="text-xs text-destructive">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div>
                <Button variant="outline" className="w-full" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                  Sign in with Google
                </Button>
              </div>
            </div>
          </form>

          <div className="relative hidden md:flex justify-center items-center p-6">
            <img src={image} alt="Image" className="h-full dark:grayscale" />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
