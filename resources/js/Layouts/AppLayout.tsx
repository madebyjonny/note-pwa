import { usePage } from "@inertiajs/react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
    createContext,
    PropsWithChildren,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Sidebar from "@/Components/Sidebar";
import { PageProps } from "@/types";

const SIDEBAR_W = 320;

// Child pages can inject action buttons into the top header via this context
export const HeaderActionsContext = createContext<(actions: ReactNode) => void>(
    () => {},
);
export const useHeaderActions = () => useContext(HeaderActionsContext);

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, notes } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);

    // Sidebar translateX as a MotionValue — decoupled from React state so drag
    // never conflicts with spring animations.
    const x = useMotionValue(-SIDEBAR_W);
    const overlayOpacity = useTransform(x, [-SIDEBAR_W, 0], [0, 1]);

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

    // Spring the sidebar to its target position whenever open/mobile state changes
    useEffect(() => {
        if (!isMobile) return;
        animate(x, sidebarOpen ? 0 : -SIDEBAR_W, {
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
        });
    }, [sidebarOpen, isMobile, x]);

    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

    return (
        <HeaderActionsContext.Provider value={setHeaderActions}>
            <div
                className="flex h-screen overflow-hidden"
                style={{ background: "var(--color-editor-bg)" }}
            >
                {/* Scrim — opacity is driven directly by the sidebar x position */}
                {isMobile && (
                    <motion.div
                        className="fixed inset-0 z-20"
                        style={{
                            background: "black",
                            opacity: overlayOpacity,
                            pointerEvents: sidebarOpen ? "auto" : "none",
                        }}
                        onClick={closeSidebar}
                    />
                )}

                {/* Sidebar */}
                {isMobile ? (
                    <motion.aside
                        className="fixed inset-y-0 left-0 z-30 overflow-hidden"
                        style={{
                            width: SIDEBAR_W,
                            x,
                            background: "var(--color-sidebar-bg)",
                            // Allow vertical scroll inside the sidebar; intercept horizontal drag
                            touchAction: "pan-y",
                        }}
                        drag="x"
                        dragConstraints={{ left: -SIDEBAR_W, right: 0 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDragEnd={(_, info) => {
                            // Close if dragged >40% of width or fast flick left
                            if (
                                info.velocity.x < -300 ||
                                x.get() < -(SIDEBAR_W * 0.4)
                            ) {
                                closeSidebar();
                            } else {
                                openSidebar();
                            }
                        }}
                    >
                        <Sidebar
                            user={auth.user}
                            notes={notes}
                            onToggle={closeSidebar}
                        />
                    </motion.aside>
                ) : (
                    <motion.aside
                        className="shrink-0 overflow-hidden"
                        style={{ background: "var(--color-sidebar-bg)" }}
                        animate={{ width: sidebarOpen ? SIDEBAR_W : 0 }}
                        initial={false}
                        transition={{
                            type: "spring",
                            damping: 32,
                            stiffness: 350,
                            mass: 0.8,
                        }}
                    >
                        <div style={{ width: SIDEBAR_W }} className="h-full">
                            <Sidebar
                                user={auth.user}
                                notes={notes}
                                onToggle={toggleSidebar}
                            />
                        </div>
                    </motion.aside>
                )}

                {/* Main content */}
                <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {/* Navigation bar — always on mobile; on desktop shown when sidebar is
                        closed OR when the page has injected actions (e.g. note editor) */}
                    {(isMobile || !sidebarOpen || !!headerActions) && (
                        <div
                            className="flex items-center justify-between h-14 px-2 shrink-0 relative z-10"
                            style={{
                                borderBottom: "1px solid var(--color-border)",
                                background: "var(--color-editor-bg)",
                            }}
                        >
                            {/* Hamburger — only when the sidebar toggle makes sense */}
                            {isMobile || !sidebarOpen ? (
                                <button
                                    onClick={toggleSidebar}
                                    className="w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "var(--color-sidebar-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            "transparent")
                                    }
                                    aria-label="Toggle sidebar"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <rect
                                            x="2"
                                            y="4"
                                            width="16"
                                            height="1.75"
                                            rx="0.875"
                                        />
                                        <rect
                                            x="2"
                                            y="9.125"
                                            width="16"
                                            height="1.75"
                                            rx="0.875"
                                        />
                                        <rect
                                            x="2"
                                            y="14.25"
                                            width="16"
                                            height="1.75"
                                            rx="0.875"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                // Spacer keeps actions right-aligned via justify-between
                                <span />
                            )}

                            {/* Actions injected by the current page (e.g. pin/delete in Show.tsx) */}
                            {headerActions && (
                                <div className="flex items-center">
                                    {headerActions}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">{children}</div>
                </main>

                {/* Left-edge swipe zone — opens sidebar on mobile.
                    Wider than the old 20px zone for easier triggering.
                    Gives real-time position feedback before the threshold. */}
                {isMobile && !sidebarOpen && (
                    <div
                        className="fixed inset-y-0 left-0 z-10 w-8"
                        style={{ touchAction: "pan-y" }}
                        onTouchStart={(e) => {
                            edgeStartX.current = e.touches[0].clientX;
                        }}
                        onTouchMove={(e) => {
                            if (edgeStartX.current === null) return;
                            const dx =
                                e.touches[0].clientX - edgeStartX.current;
                            if (dx > 0) {
                                // Move sidebar live with the finger
                                x.set(Math.min(0, -SIDEBAR_W + dx));
                            }
                            if (dx > 60) {
                                openSidebar();
                                edgeStartX.current = null;
                            }
                        }}
                        onTouchEnd={() => {
                            if (edgeStartX.current !== null) {
                                // Didn't reach threshold — spring back
                                animate(x, -SIDEBAR_W, {
                                    type: "spring",
                                    damping: 30,
                                    stiffness: 300,
                                });
                            }
                            edgeStartX.current = null;
                        }}
                    />
                )}
            </div>
        </HeaderActionsContext.Provider>
    );
}
