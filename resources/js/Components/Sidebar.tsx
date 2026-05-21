import { Link, router, usePage } from "@inertiajs/react";
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { Note, User } from "@/types";
import SidebarFooter from "./SidebarFooter";
import SidebarNoteItem, { NoteNode } from "./SidebarNoteItem";
import SidebarSearch from "./SidebarSearch";

interface Props {
    user: User;
    notes: Note[];
    onToggle: () => void;
}

function buildTree(flat: Note[]): NoteNode[] {
    const map = new Map<number, NoteNode>();
    flat.forEach((n) => map.set(n.id, { ...n, children: [] }));
    const roots: NoteNode[] = [];
    flat.forEach((n) => {
        if (n.parent_id && map.has(n.parent_id)) {
            map.get(n.parent_id)!.children!.push(map.get(n.id)!);
        } else {
            roots.push(map.get(n.id)!);
        }
    });
    return roots;
}

export default function Sidebar({ user, notes, onToggle }: Props) {
    const { url } = usePage();
    const [search, setSearch] = useState("");

    const currentId = (() => {
        const m = url.match(/\/notes\/(\d+)/);
        return m ? parseInt(m[1]) : undefined;
    })();

    const pinned = notes.filter((n) => n.is_pinned);
    const unpinned = notes.filter((n) => !n.is_pinned);
    const tree = buildTree(unpinned);

    const filtered = search
        ? notes.filter((n) =>
              n.title.toLowerCase().includes(search.toLowerCase()),
          )
        : null;

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
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer hover:bg-(--color-sidebar-hover) transition-colors duration-100"
                    style={{ color: "var(--color-text-secondary)" }}
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

            {/* Nav */}
            <div className="px-1 space-y-0.5 shrink-0">
                <Link
                    href={route("notes.index")}
                    className="flex items-center gap-3 px-3 rounded-lg cursor-pointer select-none min-h-11 hover:bg-(--color-sidebar-hover) active:scale-[0.97] transition-[background,transform] duration-100"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    <BookOpen size={18} />
                    <span className="text-[15px]">All Notes</span>
                </Link>
            </div>

            {/* Search */}
            <SidebarSearch value={search} onChange={setSearch} />

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
                            <SidebarNoteItem
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
                                    <SidebarNoteItem
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
                                    onClick={() =>
                                        router.get(route("notes.create"))
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-(--color-sidebar-hover) transition-colors duration-100"
                                    style={{
                                        color: "var(--color-text-secondary)",
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
                                <SidebarNoteItem
                                    key={n.id}
                                    note={n}
                                    currentId={currentId}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <SidebarFooter />
        </div>
    );
}
