"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { Leaf, Mail, LockKeyhole, ArrowRight, Moon } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation'

export interface IFormInput {
    email: string;
    password: string;
}

const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>({
        defaultValues: { email: "", password: "" },
    });
    const router = useRouter()
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        setMessage("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setIsError(true);
                setMessage(result.message || "Login failed. Please try again.");
                return;
            }

            setIsError(false);
            setMessage(result.message || "Login successful!");
            router.push('/tasks')
        } catch {
            setIsError(true);
            setMessage("Unable to connect. Please try again.");
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d0b] px-4 py-12 text-[#f1f5f2] selection:bg-emerald-400/30">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/[0.08] blur-[100px]" />
                <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-emerald-400/[0.06] blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0e1511] shadow-2xl shadow-black/40 md:grid-cols-2">
                {/* Left panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-[#101a14] p-10 md:flex lg:p-12">
                    <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full border border-emerald-400/[0.10]" />
                    <div className="pointer-events-none absolute -right-16 top-36 h-48 w-48 rounded-full border border-emerald-400/[0.10]" />
                    <div className="pointer-events-none absolute bottom-16 left-12 h-48 w-48 rounded-full bg-emerald-500/[0.05] blur-3xl" />

                    <a href="/" className="relative flex w-fit items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                            <Leaf size={22} />
                        </span>
                        <span className="text-xl font-semibold tracking-tight">
                            Task<span className="text-emerald-400">Sync</span>
                        </span>
                    </a>

                    <div className="relative my-16">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            YOUR WORKSPACE, IN SYNC
                        </div>

                        <h1 className="max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
                            Make space for
                            <span className="block text-emerald-400">meaningful work.</span>
                        </h1>

                        <p className="mt-5 max-w-sm text-base leading-7 text-[#9aa9a0]">
                            Bring your projects and tasks together. Stay organized, keep your
                            momentum, and focus on what matters.
                        </p>

                        <div className="mt-10 space-y-3">
                            {[
                                "Keep projects organized",
                                "Know what needs your attention",
                                "Move forward, one task at a time",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm text-[#c0ccc4]">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                                        <ArrowRight size={12} />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-xs text-[#718077]">
                        A little more clarity. A little less chaos.
                    </p>
                </section>

                {/* Login panel */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-9 lg:px-14">
                    <div className="w-full max-w-md">
                        <div className="mb-10 flex items-center justify-between md:hidden">
                            <a href="/" className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                                    <Leaf size={22} />
                                </span>
                                <span className="text-xl font-semibold tracking-tight">
                                    Task<span className="text-emerald-400">Sync</span>
                                </span>
                            </a>
                            <Moon size={19} className="text-[#839188]" />
                        </div>

                        <div className="mb-8">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Welcome back
                            </p>
                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Sign in to TaskSync
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#8f9d94]">
                                Pick up where you left off. Your workspace is waiting.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#d6dfd9]">
                                    Email address
                                </label>
                                <div className={`group flex items-center gap-3 rounded-xl border bg-[#0a100d] px-4 transition-colors focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-400/[0.08] ${errors.email ? "border-red-400/60" : "border-white/[0.10]"
                                    }`}>
                                    <Mail size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        aria-invalid={errors.email ? "true" : "false"}
                                        className="h-12 w-full bg-transparent text-sm text-[#edf4ef] outline-none placeholder:text-[#58675e]"
                                        {...register("email", { required: "Email is required" })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#d6dfd9]">
                                    Password
                                </label>
                                <div className={`group flex items-center gap-3 rounded-xl border bg-[#0a100d] px-4 transition-colors focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-400/[0.08] ${errors.password ? "border-red-400/60" : "border-white/[0.10]"
                                    }`}>
                                    <LockKeyhole size={18} className="shrink-0 text-[#77877d] transition-colors group-focus-within:text-emerald-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        aria-invalid={errors.password ? "true" : "false"}
                                        className="h-12 w-full bg-transparent text-sm text-[#edf4ef] outline-none placeholder:text-[#58675e]"
                                        {...register("password", { required: "Password is required" })}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
                                )}
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
                                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-[#07110b] transition-all hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/25 active:scale-[0.99]"
                            >
                                Sign in
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>

                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/[0.08]" />
                            <span className="text-xs text-[#69786e]">TASKSYNC WORKSPACE</span>
                            <div className="h-px flex-1 bg-white/[0.08]" />
                        </div>

                        <p className="text-center text-xs leading-6 text-[#718077]">
                            Your work, thoughtfully organized.
                            <br />
                            <span className="text-[#96a59b]">Secure access to your workspace.</span>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;