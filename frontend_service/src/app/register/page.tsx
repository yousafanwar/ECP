"use client";

import Link from "next/link";
import AuthInput from "@/app/components/AuthInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "@/app/store/authSlice";
import { RootState } from "@/app/store/store";
import { validateRegisterForm } from "@/lib/validations/authValidation";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/lib/constants/successMessages";
import { apiPublic, convertGuestToUser } from "@/lib/api";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const router = useRouter();
    const dispatch = useDispatch();
    const isGuest = useSelector((state: RootState) => state.auth.isGuest);
    const guestId = useSelector((state: RootState) => state.auth.guestId);

    const handleRegister = async () => {
        // Validate form
        const validationError = validateRegisterForm({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            let response: Response;

            if (isGuest && guestId) {
                // Convert guest to registered user (preserves cart/orders)
                response = await convertGuestToUser({
                    firstName,
                    lastName,
                    email,
                    password,
                });
            } else {
                // Standard registration
                response = await apiPublic("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        password,
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || ERROR_MESSAGES.REGISTRATION_FAILED);
            }

            const result = await response.json();

            // Clear guest data from localStorage
            localStorage.removeItem('guestId');

            if (isGuest && guestId) {
                // Guest conversion returns full auth data — log them in
                dispatch(setAuth({
                    user: {
                        userId: result.userId,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: result.email,
                    },
                    accessToken: result.access_token,
                }));

                localStorage.setItem('accessToken', result.access_token);
                localStorage.setItem('userId', result.userId);
                localStorage.setItem('userEmail', result.email);
                localStorage.setItem('firstName', result.firstName);
                localStorage.setItem('lastName', result.lastName);

                setSuccess('Account created! Your cart and orders have been preserved.');
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                setSuccess(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || ERROR_MESSAGES.REGISTRATION_ERROR);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = () => {
        setError("");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl text-black">
                <h1 className="text-3xl font-semibold mb-8">Register</h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <AuthInput
                        label="First Name"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            handleInputChange();
                        }}
                        hasError={error === "First name is required" || error === "First name must be at least 2 characters"}
                    />

                    <AuthInput
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                            handleInputChange();
                        }}
                        hasError={error === "Last name is required" || error === "Last name must be at least 2 characters"}
                    />

                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            handleInputChange();
                        }}
                        hasError={error === "Email is required" || error === "Please enter a valid email address"}
                    />

                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            handleInputChange();
                        }}
                        hasError={error === "Password is required" || error === "Password must be at least 6 characters"}
                    />

                    <AuthInput
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            handleInputChange();
                        }}
                        hasError={error === "Please confirm your password" || error === "Passwords do not match"}
                    />

                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="bg-black text-white py-3 rounded-xl hover:opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-semibold"
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                    <p className="text-center text-sm">
                        Already have an account?{" "}
                        <button 
                            className="cursor-pointer text-red-600 font-medium hover:underline"
                            onClick={() => router.push('/login')}
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}