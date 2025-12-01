// hooks/useAuthGuard.ts
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";

export function useAuthGuard() {
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return; // espera hidratar
    if (!isLoggedIn) router.replace("/(public)");
  }, [isLoading, isLoggedIn]);
}
