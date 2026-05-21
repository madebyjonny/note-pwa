import { router, usePage } from "@inertiajs/react";
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
const SPRING = {
    type: "spring" as const,
    damping: 28,
    stiffness: 280,
    mass: 0.8,
};

export const HeaderActionsContext = createContext<(actions: ReactNode) => void>(
    () => {},
);
export const useHeaderActions = () => useContext(HeaderActionsContext);

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, notes } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);

    // Single MotionValue drives both the sidebar position and the scrim opacity.
    // Nothing else animates x — no Framer drag, no conflicting springs.
    const x = useMotionValue(-SIDEBAR_W);
    const scrimOpacity = useTransform(x, [-SIDEBAR_W, 0], [0, 0.5]);

    // Ref to the active spring so we can interrupt it when the user grabs the sidebar
    const animRef = useRef<ReturnType<typeof animate> | null>(null);
    // Touch tracking refs — no React state so they never cause re-renders during a gesture
    const dragStart = useRef<{ touchX: number; startX: number } | null>(null);
    const lastTouch = useRef<{ x: number; t: number } | null>(null);
    const edgeStartX = useRef<number | null>(null);
    // Stable ref so the router.on effect always sees the latest isMobile without re-subscribing
    const isMobileRef = useRef(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            isMobileRef.current = mobile;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
                x.set(-SIDEBAR_W);
            } else {
                setSidebarOpen(true);
            }
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Close sidebar on Inertia navigation (mobile only)
    useEffect(() => {
        const remove = router.on("navigate", () => {
            if (!isMobileRef.current) return;
            setSidebarOpen(false);
            animRef.current?.stop();
            animRef.current = animate(x, -SIDEBAR_W, SPRING);
        });
        return () => remove();
    }, [x]);

    // Animate x to a target with a spring, interrupting any ongoing animation first
    const springTo = useCallback(
        (target: number) => {
            animRef.current?.stop();
            animRef.current = animate(x, target, SPRING);
        },
        [x],
    );

    const openSidebar = useCallback(() => {
        setSidebarOpen(true);
        springTo(0);
    }, [springTo]);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
        springTo(-SIDEBAR_W);
    }, [springTo]);

    const toggleSidebar = useCallback(() => {
        if (x.get() > -(SIDEBAR_W / 2)) closeSidebar();
        else openSidebar();
    }, [x, openSidebar, closeSidebar]);

    // ── Mobile sidebar touch handlers ────────────────────────────────────────
    // Attaching these to the aside element (not a Framer drag) means the sidebar
    // follows the finger with zero latency and no constraint jitter.
    const onSidebarTouchStart = useCallback(
        (e: React.TouchEvent) => {
            animRef.current?.stop(); // freeze mid-spring if the user grabs it
            dragStart.current = {
                touchX: e.touches[0].clientX,
                startX: x.get(),
            };
            lastTouch.current = { x: e.touches[0].clientX, t: Date.now() };
        },
        [x],
    );

    const onSidebarTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!dragStart.current) return;
            const dx = e.touches[0].clientX - dragStart.current.touchX;
            x.set(
                Math.max(
                    -SIDEBAR_W,
                    Math.min(0, dragStart.current.startX + dx),
                ),
            );
            lastTouch.current = { x: e.touches[0].clientX, t: Date.now() };
        },
        [x],
    );

    const onSidebarTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (!dragStart.current) return;
            const cX = e.changedTouches[0].clientX;
            const tx = x.get();
            const last = lastTouch.current;
            // Flick: fast leftward movement in the last 150 ms
            const isFlick =
                last !== null && Date.now() - last.t < 150 && cX - last.x < -20;
            dragStart.current = null;
            if (tx < -(SIDEBAR_W * 0.35) || isFlick) closeSidebar();
            else openSidebar();
        },
        [x, openSidebar, closeSidebar],
    );

    // ── Edge-swipe to open (window listeners, no z-index overlay) ────────────
    useEffect(() => {
        if (!isMobile) return;

        const onStart = (e: TouchEvent) => {
            if (sidebarOpen || e.touches[0].clientX >= 32) return;
            animRef.current?.stop();
            edgeStartX.current = e.touches[0].clientX;
            lastTouch.current = { x: e.touches[0].clientX, t: Date.now() };
        };
        const onMove = (e: TouchEvent) => {
            if (edgeStartX.current === null) return;
            const dx = e.touches[0].clientX - edgeStartX.current;
            if (dx > 0) x.set(Math.min(0, -SIDEBAR_W + dx));
            lastTouch.current = { x: e.touches[0].clientX, t: Date.now() };
            if (dx > 60) {
                edgeStartX.current = null;
                openSidebar();
            }
        };
        const onEnd = (e: TouchEvent) => {
            if (edgeStartX.current === null) return;
            const cX = e.changedTouches[0].clientX;
            const last = lastTouch.current;
            const isFlick =
                last !== null &&
                Date.now() - last.t < 150 &&
                cX - edgeStartX.current > 20;
            edgeStartX.current = null;
            if (x.get() > -(SIDEBAR_W * 0.65) || isFlick) openSidebar();
            else closeSidebar();
        };

        window.addEventListener("touchstart", onStart, { passive: true });
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onStart);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        };
    }, [isMobile, sidebarOpen, x, openSidebar, closeSidebar]);

    return (
        <HeaderActionsContext.Provider value={setHeaderActions}>
            <div
                className="flex h-dvh overflow-hidden"
                style={{ background: "var(--color-editor-bg)" }}
            >
                {/* Scrim — driven by the same MotionValue as the sidebar, perfectly in sync */}
                {isMobile && (
                    <motion.div
                        className="fixed inset-0 z-55"
                        style={{
                            background: "black",
                            opacity: scrimOpacity,
                            pointerEvents: sidebarOpen ? "auto" : "none",
                        }}
                        onClick={closeSidebar}
                    />
                )}

                {/* Mobile sidebar — MotionValue position, native touch, no Framer drag prop */}
                {isMobile && (
                    <motion.aside
                        className="fixed inset-y-0 left-0 z-60 overflow-y-auto overflow-x-hidden"
                        style={{
                            width: SIDEBAR_W,
                            x,
                            background: "var(--color-sidebar-bg)",
                            willChange: "transform",
                            touchAction: "pan-y",
                        }}
                        onTouchStart={onSidebarTouchStart}
                        onTouchMove={onSidebarTouchMove}
                        onTouchEnd={onSidebarTouchEnd}
                    >
                        <Sidebar
                            user={auth.user}
                            notes={notes}
                            onToggle={closeSidebar}
                        />
                    </motion.aside>
                )}

                {/*
                 * Mobile header — position: fixed, z-50 keeps it ABOVE the scrim (z-20)
                 * and the sidebar (z-30) so the safe area never goes black when the
                 * sidebar opens.
                 */}
                {isMobile && (
                    <div
                        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 shrink-0"
                        style={{
                            height: "calc(3.5rem + env(safe-area-inset-top))",
                            paddingTop: "env(safe-area-inset-top)",
                            borderBottom: "1px solid var(--color-border)",
                            background: "var(--color-editor-bg)",
                        }}
                    >
                        <button
                            onClick={toggleSidebar}
                            className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
                            style={{ color: "var(--color-text-secondary)" }}
                            aria-label="Toggle sidebar"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="currentColor"
                            >
                                <rect
                                    x="2"
                                    y="4.5"
                                    width="18"
                                    height="2"
                                    rx="1"
                                />
                                <rect
                                    x="2"
                                    y="10"
                                    width="18"
                                    height="2"
                                    rx="1"
                                />
                                <rect
                                    x="2"
                                    y="15.5"
                                    width="18"
                                    height="2"
                                    rx="1"
                                />
                            </svg>
                        </button>
                        {headerActions && (
                            <div className="flex items-center">
                                {headerActions}
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop sidebar — animated width, no touch required */}
                {!isMobile && (
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
                    {/* Desktop header — in normal flow, only shown when sidebar is closed or there are actions */}
                    {!isMobile && (!sidebarOpen || !!headerActions) && (
                        <div
                            className="flex items-center justify-between px-2 shrink-0 relative z-10"
                            style={{
                                height: "3.5rem",
                                borderBottom: "1px solid var(--color-border)",
                                background: "var(--color-editor-bg)",
                            }}
                        >
                            {!sidebarOpen ? (
                                <button
                                    onClick={toggleSidebar}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                    aria-label="Toggle sidebar"
                                >
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 22 22"
                                        fill="currentColor"
                                    >
                                        <rect
                                            x="2"
                                            y="4.5"
                                            width="18"
                                            height="2"
                                            rx="1"
                                        />
                                        <rect
                                            x="2"
                                            y="10"
                                            width="18"
                                            height="2"
                                            rx="1"
                                        />
                                        <rect
                                            x="2"
                                            y="15.5"
                                            width="18"
                                            height="2"
                                            rx="1"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                <span />
                            )}

                            {headerActions && (
                                <div className="flex items-center">
                                    {headerActions}
                                </div>
                            )}
                        </div>
                    )}

                    {/*
                     * Scrollable page content.
                     * On mobile: paddingTop clears the fixed header (including safe area).
                     * On desktop: no top padding needed — header is in normal flow.
                     * Bottom inset keeps content above the home indicator.
                     */}
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{
                            paddingTop: isMobile
                                ? "calc(3.5rem + env(safe-area-inset-top))"
                                : undefined,
                            paddingBottom: "env(safe-area-inset-bottom)",
                        }}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </HeaderActionsContext.Provider>
    );
}
