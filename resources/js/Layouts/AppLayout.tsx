import { usePage } from "@inertiajs/react";
import { motion, PanInfo } from "framer-motion";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import { PageProps } from "@/types";

const SIDEBAR_W = 260;

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, notes } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const edgeStartX = useRef<number | null>(null);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

    const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
        if (info.offset.x < -80 || info.velocity.x < -400) {
            setSidebarOpen(false);
        }
    }, []);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--color-editor-bg)" }}
        >
            {/* Mobile scrim */}
            {isMobile && (
                <motion.div
                    className="fixed inset-0 z-20 bg-black/50"
                    animate={{
                        opacity: sidebarOpen ? 1 : 0,
                        pointerEvents: sidebarOpen ? "auto" : "none",
                    }}
                    initial={{ opacity: 0, pointerEvents: "none" }}
                    transition={{ duration: 0.22 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — overlay on mobile, in-flow on desktop */}
            {isMobile ? (
                <motion.aside
                    className="fixed inset-y-0 left-0 z-30 overflow-hidden"
                    style={{
                        width: SIDEBAR_W,
                        background: "var(--color-sidebar-bg)",
                        touchAction: "pan-y",
                    }}
                    animate={{ x: sidebarOpen ? 0 : -SIDEBAR_W }}
                    initial={{ x: -SIDEBAR_W }}
                    drag={sidebarOpen ? "x" : false}
                    dragConstraints={{ left: -SIDEBAR_W, right: 0 }}
                    dragElastic={{ left: 0.08, right: 0 }}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    transition={{ type: "spring", damping: 32, stiffness: 350, mass: 0.8 }}
                >
                    <Sidebar user={auth.user} notes={notes} onToggle={toggleSidebar} />
                </motion.aside>
            ) : (
                <motion.aside
                    className="flex-shrink-0 overflow-hidden"
                    style={{ background: "var(--color-sidebar-bg)" }}
                    animate={{ width: sidebarOpen ? SIDEBAR_W : 0 }}
                    initial={false}
                    transition={{ type: "spring", damping: 32, stiffness: 350, mass: 0.8 }}
                >
                    <div style={{ width: SIDEBAR_W }} className="h-full">
                        <Sidebar user={auth.user} notes={notes} onToggle={toggleSidebar} />
                    </div>
                </motion.aside>
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Top bar: always on mobile (sidebar is overlay), only when closed on desktop */}
                {(isMobile || !sidebarOpen) && (
                    <div
                        className="flex items-center h-11 px-3 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
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
                                (e.currentTarget.style.background = "transparent")
                            }
                            aria-label="Toggle sidebar"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
                                <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
                                <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">{children}</div>
            </main>

            {/* Left-edge swipe zone to open sidebar on mobile */}
            {isMobile && !sidebarOpen && (
                <div
                    className="fixed inset-y-0 left-0 z-10"
                    style={{ width: 20 }}
                    onTouchStart={(e) => {
                        edgeStartX.current = e.touches[0].clientX;
                    }}
                    onTouchMove={(e) => {
                        if (
                            edgeStartX.current !== null &&
                            e.touches[0].clientX - edgeStartX.current > 60
                        ) {
                            setSidebarOpen(true);
                            edgeStartX.current = null;
                        }
                    }}
                    onTouchEnd={() => {
                        edgeStartX.current = null;
                    }}
                />
            )}
        </div>
    );
}
