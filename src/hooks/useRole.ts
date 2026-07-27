"use client";

// Open system: Everyone is an admin now.
export function useRole() {
  return {
    role: "admin",
    loading: false,
  };
}
