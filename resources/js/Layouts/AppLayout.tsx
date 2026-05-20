import { usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import { PageProps } from "@/types";

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, notes } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--color-editor-bg)" }}
        >
            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-20 bg-black/30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence initial={false}>
                {sidebarOpen && (
                    <motion.aside
                        key="sidebar"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 240, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className={`flex-shrink-0 overflow-hidden ${isMobile ? "fixed inset-y-0 left-0 z-30" : "relative"}`}
                        style={{ background: "var(--color-sidebar-bg)" }}
                    >
                        <div className="w-60 h-full">
                            <Sidebar
                                user={auth.user}
                                notes={notes}
                                onToggle={toggleSidebar}
                            />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Top bar for mobile / sidebar toggle */}
                {!sidebarOpen && (
                    <div
                        className="flex items-center h-11 px-3 flex-shrink-0"
                        style={{
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 rounded-md transition-colors cursor-pointer"
                            style={{ color: "var(--color-text-secondary)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "var(--color-sidebar-hover)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "transparent")
                            }
                            aria-label="Open sidebar"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <rect
                                    x="1"
                                    y="3"
                                    width="14"
                                    height="1.5"
                                    rx="0.75"
                                />
                                <rect
                                    x="1"
                                    y="7.25"
                                    width="14"
                                    height="1.5"
                                    rx="0.75"
                                />
                                <rect
                                    x="1"
                                    y="11.5"
                                    width="14"
                                    height="1.5"
                                    rx="0.75"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
