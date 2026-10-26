"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/navigation'
import {
    Leaf,
    Mail,
    LockKeyhole,
    UserRound,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export interface IFormInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const RegisterPage = () => {
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IFormInput>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        setMessage("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setIsError(true);
                setMessage(result.message || "Registration failed. Please try again.");
                return;
            }

            setIsError(false);
            setMessage(result.message || "Account created successfully!");
            router.push('/tasks')
        } catch {
            setIsError(true);
            setMessage("Unable to connect. Please try again.");
        }
    };

    const inputClass =
        "h-12 w-full bg-transparent text-sm text-[#edf4ef] outline-none placeholder:text-[#58675e]";

    const fieldClass =
        "group flex items-center gap-3 rounded-xl border border-white/[0.10] bg-[#0a100d] px-4 transition-colors focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-400/[0.08]";

    const labelClass =
        "mb-2 block text-sm font-medium text-[#d6dfd9]";

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d0b] px-4 py-10 text-[#f1f5f2] selection:bg-emerald-400/30">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/[0.08] blur-[100px]" />
                <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-emerald-400/[0.06] blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0e1511] shadow-2xl shadow-black/40 md:grid-cols-2">
                {/* Branding panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-[#101a14] p-10 md:flex lg:p-12">
                    <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full border border-emerald-400/[0.10]" />
                    <div className="pointer-events-none absolute -right-16 top-36 h-48 w-48 rounded-full border border-emerald-400/[0.10]" />
                    <div className="pointer-events-none absolute bottom-16 left-12 h-48 w-48 rounded-full bg-emerald-500/[0.05] blur-3xl" />

                    <Link href="/" className="relative flex w-fit items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                            <Leaf size={22} />
                        </span>
                        <span className="text-xl font-semibold tracking-tight">
                            Task<span className="text-emerald-400">Sync</span>
                        </span>
                    </Link>

                    <div className="relative my-16">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            START WITH CLARITY
                        </div>

                        <h1 className="max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
                            Build better
                            <span className="block text-emerald-400">work habits.</span>
                        </h1>

                        <p className="mt-5 max-w-sm text-base leading-7 text-[#9aa9a0]">
                            Create your workspace, bring your projects together, and make
                            progress one task at a time.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                "Keep projects and tasks organized",
                                "See your work in one place",
                                "Make room for focused work",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm text-[#c0ccc4]">
                                    <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-xs text-[#718077]">
                        A little more clarity. A little less chaos.
                    </p>
                </section>

                {/* Registration form */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-9 lg:px-14">
                    <div className="w-full max-w-md">
                        <div className="mb-8 md:hidden">
                            <Link href="/" className="flex w-fit items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                                    <Leaf size={22} />
                                </span>
                                <span className="text-xl font-semibold tracking-tight">
                                    Task<span className="text-emerald-400">Sync</span>
                                </span>
                            </Link>
                        </div>

                        <div className="mb-7">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Get started
                            </p>
                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Create your account
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#8f9d94]">
                                Set up your workspace and get organized.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className={labelClass}>
                                        First name
                                    </label>
                                    <div className={fieldClass}>
                                        <UserRound size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                        <input
                                            id="firstName"
                                            type="text"
                                            autoComplete="given-name"
                                            placeholder="First name"
                                            aria-invalid={!!errors.firstName}
                                            className={inputClass}
                                            {...register("firstName", {
                                                required: "First name is required",
                                            })}
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-2 text-xs text-red-400">{errors.firstName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className={labelClass}>
                                        Last name
                                    </label>
                                    <div className={fieldClass}>
                                        <UserRound size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                        <input
                                            id="lastName"
                                            type="text"
                                            autoComplete="family-name"
                                            placeholder="Last name"
                                            aria-invalid={!!errors.lastName}
                                            className={inputClass}
                                            {...register("lastName", {
                                                required: "Last name is required",
                                            })}
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-2 text-xs text-red-400">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email address
                                </label>
                                <div className={fieldClass}>
                                    <Mail size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        aria-invalid={!!errors.email}
                                        className={inputClass}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "Enter a valid email address",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className={labelClass}>
                                    Password
                                </label>
                                <div className={fieldClass}>
                                    <LockKeyhole size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Create a password"
                                        aria-invalid={!!errors.password}
                                        className={inputClass}
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
                                )}
                                <p className="mt-2 text-xs text-[#718077]">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            {message && (
                                <div
                                    role={isError ? "alert" : "status"}
                                    aria-live="polite"
                                    className={`rounded-lg border px-4 py-3 text-sm ${isError
                                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                                            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                        }`}
                                >
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-[#07110b] transition-all hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Creating account..." : "Create account"}
                                {!isSubmitting && (
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                )}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-[#8f9d94]">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                            >
                                Sign in
                            </Link>
                        </p>

                        <div className="mt-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/[0.08]" />
                            <span className="text-xs text-[#69786e]">TASKSYNC WORKSPACE</span>
                            <div className="h-px flex-1 bg-white/[0.08]" />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default RegisterPage;