"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#1f2937",
          color: "#ffffff",
          padding: "14px 18px",
        },
        success: {
          duration: 2500,
        },
        error: {
          duration: 4000,
        },
      }}
    />
  );
}