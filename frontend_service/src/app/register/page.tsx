"use client";

import AuthInput from "@/app/components/AuthInput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "@/app/store/authSlice";
import { RootState } from "@/app/store/store";
import { validateRegisterForm, normalizeRegisterPhone, formatPhoneAsYouType } from "@/lib/validations/authValidation";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/lib/constants/successMessages";
import { apiPublic, convertGuestToUser } from "@/lib/api";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const router = useRouter();
    const dispatch = useDispatch();
    const isGuest = useSelector((state: RootState) => state.auth.isGuest);
    const guestId = useSelector((state: RootState) => state.auth.guestId);

    const handleRegister = async () => {
        // Validate form
        const phoneNorm = normalizeRegisterPhone(phone);
        const validationError = validateRegisterForm({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phone: phoneNorm,
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
                    phone: phoneNorm,
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
                        phone: phoneNorm,
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
            <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-lg border border-gray-100 text-gray-900">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                    <p className="text-sm text-gray-500 mt-1">Join Bird Buzz today</p>
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
                        label="Phone number"
                        type="tel"
                        placeholder="+92 3xx xxxxxxx"
                        value={phone}
                        onChange={(e) => {
                            setPhone(formatPhoneAsYouType(e.target.value));
                            handleInputChange();
                        }}
                        hasError={error === ERROR_MESSAGES.PHONE_REQUIRED || error === ERROR_MESSAGES.PHONE_INVALID}
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
                        className="bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <button 
                            className="cursor-pointer text-indigo-600 font-medium hover:underline"
                            onClick={() => router.push('/login')}
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}