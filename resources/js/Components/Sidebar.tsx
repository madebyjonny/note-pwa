import { Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    LogOut,
    Moon,
    Plus,
    Search,
    Settings,
    Sun,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Note, User } from "@/types";

interface Props {
    user: User;
    notes: Note[];
    onToggle: () => void;
}

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

function NoteItem({
    note,
    currentId,
    depth = 0,
}: {
    note: Note & { children?: Note[] };
    currentId?: number;
    depth?: number;
}) {
    const isActive = note.id === currentId;
    const [expanded, setExpanded] = useState(false);
    const hasChildren = note.children && note.children.length > 0;

    return (
        <div>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2 rounded-lg mx-1 cursor-pointer select-none min-h-11"
                style={{
                    paddingLeft: `${10 + depth * 18}px`,
                    paddingRight: "6px",
                    background: isActive
                        ? "var(--color-sidebar-active)"
                        : "transparent",
                    color: isActive
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                }}
                onMouseEnter={(e) => {
                    if (!isActive)
                        e.currentTarget.style.background =
                            "var(--color-sidebar-hover)";
                }}
                onMouseLeave={(e) => {
                    if (!isActive)
                        e.currentTarget.style.background = "transparent";
                }}
            >
                {hasChildren ? (
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {expanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                ) : (
                    <span className="w-6 shrink-0" />
                )}

                <Link
                    href={route("notes.show", { note: note.id })}
                    className="flex items-center gap-2 flex-1 min-w-0 text-[15px] py-1"
                >
                    <span className="shrink-0 text-lg leading-none">
                        {note.emoji ?? "📄"}
                    </span>
                    <span className="truncate">{note.title || "Untitled"}</span>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.delete(
                            route("notes.destroy", { note: note.id }),
                            {
                                preserveScroll: false,
                            },
                        );
                    }}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    aria-label="Delete note"
                >
                    <Trash2 size={14} />
                </button>
            </motion.div>

            {hasChildren && expanded && (
                <div>
                    {note.children!.map((child) => (
                        <NoteItem
                            key={child.id}
                            note={child}
                            currentId={currentId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ user, notes, onToggle }: Props) {
    const { theme, toggle: toggleTheme } = useTheme();
    const { url } = usePage();
    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Extract current note id from URL like /notes/42
    const currentId = (() => {
        const m = url.match(/\/notes\/(\d+)/);
        return m ? parseInt(m[1]) : undefined;
    })();

    useEffect(() => {
        if (showSearch) searchRef.current?.focus();
    }, [showSearch]);

    // Build tree from flat list
    const buildTree = (flat: Note[]): (Note & { children?: Note[] })[] => {
        const map = new Map<number, Note & { children?: Note[] }>();
        flat.forEach((n) => map.set(n.id, { ...n, children: [] }));
        const roots: (Note & { children?: Note[] })[] = [];
        flat.forEach((n) => {
            if (n.parent_id && map.has(n.parent_id)) {
                map.get(n.parent_id)!.children!.push(map.get(n.id)!);
            } else {
                roots.push(map.get(n.id)!);
            }
        });
        return roots;
    };

    const pinned = notes.filter((n) => n.is_pinned);
    const unpinned = notes.filter((n) => !n.is_pinned);
    const tree = buildTree(unpinned);

    const filtered = search
        ? notes.filter((n) =>
              n.title.toLowerCase().includes(search.toLowerCase()),
          )
        : null;

    const handleNewNote = () => {
        router.get(route("notes.create"));
    };

    return (
        <div className="flex flex-col h-full text-sm">
            {/* Workspace header */}
            <div className="flex items-center justify-between px-3 h-14 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-semibold"
                        style={{ background: "#37352f" }}
                    >
                        {user.name[0]?.toUpperCase()}
                    </div>
                    <span
                        className="truncate text-[15px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {user.name}
                    </span>
                </div>
                <button
                    onClick={onToggle}
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "var(--color-sidebar-hover)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                    aria-label="Close sidebar"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                    >
                        <path
                            d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3V2zm1 12h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H7v12z"
                            opacity="0.3"
                        />
                        <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3V2z" />
                    </svg>
                </button>
            </div>

            {/* Nav items */}
            <div className="px-1 space-y-0.5 shrink-0">
                {[
                    {
                        icon: <Search size={18} />,
                        label: "Search",
                        action: () => setShowSearch((v) => !v),
                    },
                    {
                        icon: <BookOpen size={18} />,
                        label: "All Notes",
                        href: route("notes.index"),
                    },
                ].map((item) => (
                    <motion.div
                        key={item.label}
                        whileTap={{ scale: 0.97 }}
                        onClick={item.action}
                        className="flex items-center gap-3 px-3 rounded-lg cursor-pointer min-h-11"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "var(--color-sidebar-hover)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        {item.icon}
                        {item.href ? (
                            <Link href={item.href} className="text-[15px]">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-[15px]">{item.label}</span>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Search box */}
            {showSearch && (
                <div className="px-2 pt-1 pb-0.5">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Escape" &&
                            (setShowSearch(false), setSearch(""))
                        }
                        className="w-full px-2 py-1.5 text-base rounded-md outline-none"
                        style={{
                            background: "var(--color-sidebar-active)",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                    />
                </div>
            )}

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto mt-2">
                {filtered ? (
                    <div>
                        <div
                            className="px-3 py-1 text-xs font-medium uppercase tracking-wider"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Results
                        </div>
                        {filtered.map((n) => (
                            <NoteItem
                                key={n.id}
                                note={n}
                                currentId={currentId}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {pinned.length > 0 && (
                            <div className="mb-2">
                                <div
                                    className="px-3 py-1 text-xs font-medium uppercase tracking-wider"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Pinned
                                </div>
                                {pinned.map((n) => (
                                    <NoteItem
                                        key={n.id}
                                        note={n}
                                        currentId={currentId}
                                    />
                                ))}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between px-3 py-1">
                                <span
                                    className="text-xs font-medium uppercase tracking-wider"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Notes
                                </span>
                                <button
                                    onClick={handleNewNote}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "var(--color-sidebar-hover)";
                                        e.currentTarget.style.color = "var(--color-text-primary)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "var(--color-text-secondary)";
                                    }}
                                    aria-label="New note"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            {tree.length === 0 && (
                                <p
                                    className="px-3 py-2 text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    No notes yet.
                                </p>
                            )}
                            {tree.map((n) => (
                                <NoteItem
                                    key={n.id}
                                    note={n}
                                    currentId={currentId}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom actions */}
            <div
                className="border-t px-1 py-1.5 space-y-0.5 shrink-0"
                style={{ borderColor: "var(--color-border)" }}
            >
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 rounded-lg cursor-pointer min-h-11"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "var(--color-sidebar-hover)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    <span className="text-[15px]">
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                    </span>
                </motion.div>

                <Link href={route("profile.edit")}>
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-3 rounded-lg cursor-pointer min-h-11"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "var(--color-sidebar-hover)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        <Settings size={18} />
                        <span className="text-[15px]">Settings</span>
                    </motion.div>
                </Link>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="w-full"
                >
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 px-3 rounded-lg cursor-pointer min-h-11 w-full"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "var(--color-sidebar-hover)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        <LogOut size={18} />
                        <span className="text-[15px]">Sign out</span>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
