"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <button
        onClick={() => signIn("google", { callbackUrl: "/upload" })}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Continue with Google
      </button>
    </div>
  );
}




