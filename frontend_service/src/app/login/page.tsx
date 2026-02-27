"use client";

import Link from "next/link";
import AuthInput from "@/app/components/AuthInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateLoginForm } from "@/lib/validations/authValidation";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/lib/constants/successMessages";

export default function LoginPage() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const router = useRouter();

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
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || ERROR_MESSAGES.LOGIN_FAILED);
            }
            const result = await response.json();
            setSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            localStorage.setItem('bearerToken', result.access_token);

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
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl text-black">
                <h1 className="text-3xl font-semibold mb-8">Login</h1>

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
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            handleInputChange();
                        }}
                        value={email}
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
                    />

                    <div className="text-right">
                        <Link
                            href="#"
                            className="text-red-600 text-sm hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        className="bg-black text-white py-3 rounded-xl hover:opacity-90 transition disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-semibold"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <p className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <button 
                            className="cursor-pointer text-red-600 font-medium hover:underline"
                            onClick={() => router.push('/register')}
                        >
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}