import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center p-4"
            style={{ background: "var(--color-editor-bg)" }}
        >
            {/* Logo */}
            <Link
                href="/"
                className="mb-8 flex items-center gap-2 no-underline"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--color-text-primary)" }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="128"
                            y="128"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="186"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="244"
                            width="196"
                            height="20"
                            rx="10"
                            fill="white"
                            opacity="0.6"
                        />
                        <rect
                            x="128"
                            y="302"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="360"
                            width="156"
                            height="20"
                            rx="10"
                            fill="white"
                            opacity="0.6"
                        />
                    </svg>
                </div>
                <span
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Notes
                </span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-sm rounded-xl p-8"
                style={{
                    background: "var(--color-sidebar-bg)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
