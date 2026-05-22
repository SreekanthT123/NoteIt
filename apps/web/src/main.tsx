import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
const googleClientId =  "277559028161-a2fj2g916dgjsgrrirl4r59q3vo8c41j.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
        <Toaster richColors />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
