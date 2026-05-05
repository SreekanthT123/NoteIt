import React, { useState } from "react";
import { api } from "../../api/client";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export const Signup = ({ onAuth }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { email, password });
      localStorage.setItem("token", res.data.token);
      onAuth();
    } catch (err: any) {
      setError(err.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button onClick={handleSignup}>Signup</Button>
      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
};
