import React, { useState } from "react";
import { api } from "../../api/client";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "../../components/ui/field";
import { GoogleLogin } from "@react-oauth/google";

export const Login = ({ onAuth }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (newUser) {
        const res = await api.post("/auth/signup", { email, password });
        localStorage.setItem("token", res.data.token);
        onAuth(true);
      } else {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        onAuth(true);
      }
    } catch (err: any) {
      setError(err.response.data.error);
      onAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const res = await api.post("/auth/google", {
      idToken: credentialResponse.credential, // ✅ match backend
    });

    localStorage.setItem("token", res.data.token);
    onAuth(true);
  };
  return (
    <div className="">
      <form className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">
              {newUser ? "Sign up" : "Login"} to your account
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to {newUser ? "sign up" : "login"} to your
              account
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              {!newUser && (
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              )}
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {newUser && (
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
          )}
          <Field>
            <Button
              disabled={
                loading ||
                !email ||
                !password ||
                (newUser && !confirmPassword) ||
                (newUser && password !== confirmPassword)
              }
              type="submit"
              onClick={handleLogin}
            >
              {loading ? "Loading..." : newUser ? "Sign up" : "Login"}
            </Button>
          </Field>
          <FieldSeparator className="my-2">Or continue with</FieldSeparator>
          <Field>
            {/* <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {newUser ? "Sign up with Google" : "Login with Google"}
            </Button> */}
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log("Login Failed")}
              auto_select={false}
              useOneTap={false}
            />
            <FieldDescription className="text-center">
              {newUser ? "Already have an account?" : "Don't have an account?"}{" "}
              <a
                onClick={() => setNewUser(!newUser)}
                href="#"
                className="underline underline-offset-4"
              >
                {newUser ? "Login" : "Sign up"}
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>

      {/* <Field>
        <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
        <Input
          id="input-field-username"
          type="text"
          placeholder="Enter your username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="input-field-password">Password</FieldLabel>
        <Input
          id="input-field-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button onClick={handleLogin}>Login</Button> */}
      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
};
