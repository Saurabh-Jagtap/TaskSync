import { useEffect, useState } from "react";
import { LogOut, LoaderCircle, Sun, Moon, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const router = useRouter();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState("");
    const [logoutError, setLogoutError] = useState(false);

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        const shouldUseDark =
            savedTheme === "dark" ||
            (savedTheme === null && prefersDark);

        setIsDark(shouldUseDark);
        document.documentElement.classList.toggle("dark", shouldUseDark);
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;

        setIsDark(nextIsDark);
        document.documentElement.classList.toggle("dark", nextIsDark);
        localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setLogoutMessage("");
        setLogoutError(false);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                setLogoutError(true);
                setLogoutMessage(
                    result?.message || "Logout failed. Please try again."
                );
                return;
            }

            setLogoutMessage("Logged out successfully.");
            router.replace("/auth/login");
            router.refresh();
        } catch {
            setLogoutError(true);
            setLogoutMessage(
                "Unable to connect. Check your connection and try again."
            );
        } finally {
            setIsLoggingOut(false);
        }
    };
    return (
        <div>
            <nav
                aria-label="Main navigation"
                className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
            >
                <a
                    href="/"
                    className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    aria-label="TaskSync home"
                >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:group-hover:bg-emerald-900">
                        <Leaf className="size-5" strokeWidth={2.2} />
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        TaskSync
                    </span>
                </a>

                <div className="flex gap-5">

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            onClick={toggleTheme}
                            className="size-10 rounded-full border-border bg-background transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        >
                            {isDark ? (
                                <Sun className="size-[18px]" />
                            ) : (
                                <Moon className="size-[18px]" />
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoggingOut}
                            onClick={handleLogout}
                            className="h-10 gap-2 rounded-full border-border px-3 sm:px-4 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/40"
                        >
                            {isLoggingOut ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <LogOut className="size-4" />
                            )}

                            <span className="hidden sm:inline">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        </Button>
                    </div>
                </div>
            </nav>

            {logoutMessage && (
                <div
                    role={logoutError ? "alert" : "status"}
                    aria-live="polite"
                    className={`mx-auto mt-2 w-fit max-w-[calc(100%-2rem)] rounded-lg border px-4 py-2 text-sm ${logoutError
                        ? "border-red-500/20 bg-red-500/10 text-red-500"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        }`}
                >
                    {logoutMessage}
                </div>
            )}
        </div>
    )
}

export default Navbar
