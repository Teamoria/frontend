import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleButton } from "./FormControls.jsx";
import { loginWithGoogle } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleAuthButton({ children, disabled = false, onError, onStart }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          throw new Error("Google did not return an access token.");
        }

        const payload = await loginWithGoogle(tokenResponse.access_token);
        login(payload?.data?.user || payload?.data || null);
        window.location.hash = "/dashboard";
      } catch (error) {
        onError?.(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
      onError?.("Google sign-in was cancelled or failed.");
    }
  });

  function handleClick() {
    if (!GOOGLE_CLIENT_ID) {
      onError?.("Google Client ID is missing. Add VITE_GOOGLE_CLIENT_ID to your .env file.");
      return;
    }

    onStart?.();
    setIsLoading(true);
    googleLogin();
  }

  return (
    <GoogleButton disabled={disabled || isLoading} onClick={handleClick}>
      {isLoading ? "Connecting to Google..." : children}
    </GoogleButton>
  );
}
