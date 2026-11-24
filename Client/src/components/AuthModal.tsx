
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext.tsx";
import {
    X, Mail, Lock, User, Phone, Eye, EyeOff, Check, X as Cross
} from "lucide-react";
import {
    getCountries,
    getCountryCallingCode,
    isValidPhoneNumber,
    parsePhoneNumberFromString,
    type CountryCode
} from "libphonenumber-js";

// Generate country list with international dialing codes
const countryOptions = getCountries()
    .map((country) => ({
        code: country,
        name: new Intl.DisplayNames(["en"], { type: "region" }).of(country) || country,
        callingCode: getCountryCallingCode(country),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, login, register } = useAppContext();

    const [isLoginTab, setIsLoginTab] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneCountry, setPhoneCountry] = useState<CountryCode>("IN");
    const [isOwner, setIsOwner] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    if (!isAuthModalOpen) return null;

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const isPasswordStrong = hasMinLength && hasNumber && hasSpecialChar;

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setPhoneCountry("IN");
        setIsOwner(false);
        setShowPassword(false);
        setPhoneError("");
    };

    const handleClose = () => {
        resetForm();
        setAuthModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formLoading) return;

        if (!isLoginTab) {
            if (!isPasswordStrong) return;

            // Phone is optional, but if provided it must be valid
            if (phone && !isValidPhoneNumber(phone, phoneCountry)) {
                setPhoneError("Please enter a valid phone number.");
                return;
            }
        }

        setFormLoading(true);

        try {
            let success: boolean;

            if (isLoginTab) {
                success = await login(email, password);
            } else {
                const parsedPhone = phone
                    ? parsePhoneNumberFromString(phone, phoneCountry)
                    : undefined;

                const formattedPhone = parsedPhone?.number || "";

                success = await register(
                    name,
                    email,
                    password,
                    formattedPhone,
                    isOwner ? "owner" : "user"
                );
            }

            if (success) handleClose();
        } finally {
            setFormLoading(false);
        }
    };

    const passwordRule = (valid: boolean, label: string) => (
        <div className={`flex items-center gap-2 text-[11px] ${valid ? "text-green-600" : "text-black/45"}`}>
            {valid ? <Check size={13} /> : <Cross size={13} />}
            {label}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={handleClose}></div>

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-outline-variant/30 ambient-shadow rounded-lg z-10 flex flex-col">

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-black/55 hover:text-primary cursor-pointer z-10"
                    aria-label="Close"
                    type="button"
                >
                    <X size={20} />
                </button>

                {/* Header Tabs */}
                <div className="flex border-b border-outline-variant/20 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsLoginTab(true)}
                        className={`flex-1 py-5 text-center text-xs font-medium tracking-widest ${
                            isLoginTab
                                ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
                                : "text-black/55 bg-surface-container-low/50"
                        }`}
                    >
                        SIGN IN
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLoginTab(false)}
                        className={`flex-1 py-5 text-center text-xs font-medium tracking-widest ${
                            !isLoginTab
                                ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
                                : "text-black/55 bg-surface-container-low/50"
                        }`}
                    >
                        SIGN UP
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl font-medium text-primary">
                                Welcome to QuickDine
                            </h2>
                            <p className="text-xs text-black/55 mt-2">
                                Access your exclusive reservations and curated dining profile.
                            </p>
                        </div>

                        <div className="space-y-5">

                            {/* Name */}
                            {!isLoginTab && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-black/55 tracking-wider uppercase">
                                        FULL NAME
                                    </label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-0 top-2 text-black/55" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full pl-7 pb-2 pt-1 text-sm bg-transparent border-b border-outline-variant/60 focus:border-secondary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-black/55 tracking-wider uppercase">
                                    EMAIL ADDRESS
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-0 top-2 text-black/55" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-7 pb-2 pt-1 text-sm bg-transparent border-b border-outline-variant/60 focus:border-secondary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            {!isLoginTab && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-black/55 tracking-wider uppercase">
                                        PHONE NUMBER (OPTIONAL)
                                    </label>

                                    <div className="flex items-center gap-2 border-b border-outline-variant/60 focus-within:border-secondary">
                                        <Phone size={16} className="text-black/55 shrink-0" />

                                        <select
                                            value={phoneCountry}
                                            onChange={(e) => {
                                                setPhoneCountry(e.target.value as CountryCode);
                                                setPhone("");
                                                setPhoneError("");
                                            }}
                                            className="max-w-[145px] bg-transparent py-2 text-xs outline-none cursor-pointer"
                                            aria-label="Country code"
                                        >
                                            {countryOptions.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name} (+{country.callingCode})
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={phone}
                                            maxLength={phoneCountry === "IN" ? 10 : 15}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, "");
                                                const maxLength = phoneCountry === "IN" ? 10 : 15;
                                                setPhone(digits.slice(0, maxLength));
                                                setPhoneError("");
                                            }}
                                            placeholder="Enter phone number"
                                            className="min-w-0 flex-1 py-2 text-sm bg-transparent outline-none"
                                        />
                                    </div>

                                    {phoneError && (
                                        <p className="text-[11px] text-red-600 mt-1">{phoneError}</p>
                                    )}
                                </div>
                            )}

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-black/55 tracking-wider uppercase">
                                    PASSWORD
                                </label>

                                <div className="relative">
                                    <Lock size={16} className="absolute left-0 top-2 text-black/55" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-7 pr-9 pb-2 pt-1 text-sm bg-transparent border-b border-outline-variant/60 focus:border-secondary focus:outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1 text-black/55 hover:text-primary"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>

                                {/* Password Rules: Signup only */}
                                {!isLoginTab && (
                                    <div className="pt-3 space-y-1.5">
                                        <p className="text-[10px] font-medium text-black/55 uppercase tracking-wider">
                                            Password must contain:
                                        </p>
                                        {passwordRule(hasMinLength, "At least 8 characters")}
                                        {passwordRule(hasNumber, "At least one number")}
                                        {passwordRule(hasSpecialChar, "At least one special character")}
                                    </div>
                                )}
                            </div>

                            {/* Owner Checkbox */}
                            {!isLoginTab && (
                                <div className="flex items-center gap-2.5 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isOwner"
                                        checked={isOwner}
                                        onChange={(e) => setIsOwner(e.target.checked)}
                                        className="h-4 w-4 accent-secondary cursor-pointer"
                                    />
                                    <label htmlFor="isOwner" className="text-xs text-black/55 cursor-pointer">
                                        I am a Restaurant Owner / Manager
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={formLoading || (!isLoginTab && !isPasswordStrong)}
                            className="w-full bg-primary hover:bg-secondary text-white py-3.5 px-4 text-xs font-medium tracking-widest uppercase disabled:opacity-50 cursor-pointer"
                        >
                            {formLoading
                                ? "PROCESSING..."
                                : isLoginTab
                                    ? "LOGIN"
                                    : "CREATE ACCOUNT"}
                        </button>

                        <p className="text-center text-[11px] text-black/55 mt-4">
                            By signing in, you agree to our{" "}
                            <a href="#" className="underline hover:text-primary">
                                Terms of Service
                            </a>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
