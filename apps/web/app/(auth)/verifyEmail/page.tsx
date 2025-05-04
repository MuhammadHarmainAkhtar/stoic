"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, ChangeEvent } from "react";
import CustomField from "../../components/CustomField";

const page = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get email from localStorage that was saved during signup
    const storedEmail = localStorage.getItem("verificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Redirect to signup if no email is stored
      router.push("/signup");
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  // Auto-verification effect when code is entered
  useEffect(() => {
    const verifyCode = async () => {
      if (verificationCode.length === 6 && email) {
        try {
          const response = await fetch("http://localhost:9000/api/auth/verifyToken", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              verificationToken: verificationCode,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setVerificationStatus("success");
            setErrorMessage("");
            localStorage.removeItem("verificationEmail"); // Clean up
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          } else {
            setVerificationStatus("error");
            setErrorMessage(data.message || "Verification failed. Please try again.");
            // Reset after 3 seconds
            setTimeout(() => {
              setVerificationStatus("");
              setErrorMessage("");
              setVerificationCode(""); // Clear the input on error
            }, 3000);
          }
        } catch (error) {
          console.error("Verification error:", error);
          setVerificationStatus("error");
          setErrorMessage("Network error. Please check your connection.");
          setTimeout(() => {
            setVerificationStatus("");
            setErrorMessage("");
            setVerificationCode(""); // Clear the input on error
          }, 3000);
        }
      }
    };

    verifyCode();
  }, [verificationCode, email, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Only allow alphanumeric characters
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setVerificationCode(sanitizedValue.toLowerCase());
  };

  return (
    <div
      className="w-full h-screen relative"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: isMobile
          ? "url('/authBackgroundMobile.png')"
          : "url('/authDesktopBackground.jpg')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="space-y-4 lg:mb-0 lg:flex-1 flex flex-col items-center">
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
                  verificationStatus === "success" ? "border-green-500" : 
                  verificationStatus === "error" ? "border-red-500" : ""
                }`}
                type="text" 
                name="VerifyEmail" 
                value={verificationCode}
                onChange={handleChange}
                maxLength={6}
              />
              {verificationStatus === "success" && (
                <p className="text-green-500 font-semibold">Verification successful! Redirecting...</p>
              )}
              {verificationStatus === "error" && (
                <p className="text-red-500 font-semibold">{errorMessage}</p>
              )}
            </>
          ) : (
            <p className="text-red-500 font-semibold">No email found. Redirecting to signup...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
