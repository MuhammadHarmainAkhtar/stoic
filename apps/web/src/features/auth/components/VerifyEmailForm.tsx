"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CustomField from "../../../../app/components/CustomField";
import AuthLayout from "./AuthLayout";
import authService from "../services/authService";

/**
 * Component for email verification process
 */
export default function VerifyEmailForm() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/signup");
    }
  }, [router]);

  useEffect(() => {
    const verifyCode = async () => {
      if (verificationCode.length === 6 && email) {
        try {
          const response = await authService.verifyEmail({
            email,
            verificationToken: verificationCode
          });

          if (response.success) {
            handleSuccess();
          } else {
            handleError(response.message || "Verification failed. Please try again.");
          }
        } catch (error) {
          console.error("Verification error:", error);
          handleError("Network error. Please check your connection.");
        }
      }
    };

    verifyCode();
  }, [verificationCode, email]);

  const handleSuccess = () => {
    setVerificationStatus("success");
    setErrorMessage("");
    localStorage.removeItem("verificationEmail");
    setTimeout(() => router.push("/login"), 2000);
  };

  const handleError = (message: string) => {
    setVerificationStatus("error");
    setErrorMessage(message);
    setTimeout(() => {
      setVerificationStatus("");
      setErrorMessage("");
      setVerificationCode("");
    }, 3000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setVerificationCode(sanitizedValue.toLowerCase());
  };

  return (
    <AuthLayout>
      <div className="mt-26 space-y-4 lg:mb-0 lg:flex-1 flex flex-col items-center">
        <h2 className="text-4xl sm:text-7xl lg:text-8xl font-bold text-center lg:text-left font-[bruneyfont] text-black/80 mb-1 lg:mt-0 mt-4">
          Hey Stoic
        </h2>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-[bruneyfont] text-center text-black/80">
          Enter The Token
        </h3>
        {email ? (
          <>
            <CustomField
              className={`transition-all duration-300 ${
                verificationStatus === "success"
                  ? "border-green-500"
                  : verificationStatus === "error"
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              name="VerifyEmail"
              value={verificationCode}
              onChange={handleChange}
              maxLength={6}
            />
            {verificationStatus === "success" && (
              <p className="text-green-500 font-semibold">
                Verification successful! Redirecting...
              </p>
            )}
            {verificationStatus === "error" && (
              <p className="text-red-500 font-semibold">{errorMessage}</p>
            )}
          </>
        ) : (
          <p className="text-red-500 font-semibold">
            No email found. Redirecting to signup...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}