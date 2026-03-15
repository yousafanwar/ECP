import { useState } from "react";

type Props = {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
};

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hasError = false,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
            isPassword ? "pr-11" : ""
          } ${
            hasError
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-black"
          }`}
          onChange={onChange}
          value={value}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye-off icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.568M6.343 6.343A9.956 9.956 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-2.168 3.568M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
              </svg>
            ) : (
              // Eye icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}