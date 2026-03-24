"use client";

import Link from "next/link";
import AuthInput from "@/app/components/AuthInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuth } from "@/app/store/authSlice";
import { validateLoginForm } from "@/lib/validations/authValidation";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/lib/constants/successMessages";
import { apiPublic } from "@/lib/api";

export default function LoginPage() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const router = useRouter();
    const dispatch = useDispatch();

    const handleLogin = async () => {
        // Validate form
        const validationError = validateLoginForm({
            email,
            password,
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await apiPublic('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || ERROR_MESSAGES.LOGIN_FAILED);
            }
            
            const result = await response.json();
            
            // Clear any guest session data
            localStorage.removeItem('guestId');

            // Dispatch to Redux store
            dispatch(setAuth({
                user: {
                    userId: result.userId,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: email,
                    isAdmin: result.isAdmin ?? false,
                },
                accessToken: result.access_token,
            }));

            // Also store in localStorage for persistence (only access token)
            localStorage.setItem('accessToken', result.access_token);
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('firstName', result.firstName);
            localStorage.setItem('lastName', result.lastName);
            localStorage.setItem('isAdmin', String(result.isAdmin ?? false));

            setSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);

            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (err: any) {
            setError(err.message || ERROR_MESSAGES.LOGIN_ERROR);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = () => {
        setError("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-lg border border-gray-100 text-gray-900">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {success}
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <AuthInput
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            handleInputChange();
                        }}
                        value={email}
                        hasError={error === "Email is required" || error === "Please enter a valid email address"}
                    />

                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            handleInputChange();
                        }}
                        value={password}
                        hasError={error === "Password is required"}
                    />

                    <div className="text-right">
                        <Link
                            href="#"
                            className="text-indigo-600 text-sm hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        className="bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <button 
                            className="cursor-pointer text-indigo-600 font-medium hover:underline"
                            onClick={() => router.push('/register')}
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}