import { Link } from "@inertiajs/react";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useState } from "react";

function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window === "undefined") return "light";
        return document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";
    });

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("theme", next);
        setTheme(next);
    };

    return { theme, toggle };
}

const rowClass =
    "flex items-center gap-3 px-3 rounded-lg cursor-pointer select-none min-h-11 hover:bg-(--color-sidebar-hover) active:scale-[0.97] transition-[background,transform] duration-100";

export default function SidebarFooter() {
    const { theme, toggle } = useTheme();

    return (
        <div
            className="border-t px-1 py-1.5 space-y-0.5 shrink-0"
            style={{ borderColor: "var(--color-border)" }}
        >
            <button
                onClick={toggle}
                className={`w-full ${rowClass}`}
                style={{ color: "var(--color-text-secondary)" }}
            >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-[15px]">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                </span>
            </button>

            <Link
                href={route("profile.edit")}
                prefetch
                className={rowClass}
                style={{ color: "var(--color-text-secondary)" }}
            >
                <Settings size={18} />
                <span className="text-[15px]">Settings</span>
            </Link>

            <Link
                href={route("logout")}
                method="post"
                as="button"
                className={`w-full ${rowClass}`}
                style={{ color: "var(--color-text-secondary)" }}
            >
                <LogOut size={18} />
                <span className="text-[15px]">Sign out</span>
            </Link>
        </div>
    );
}
