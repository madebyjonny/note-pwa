import { Link, router } from "@inertiajs/react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Note } from "@/types";

export type NoteNode = Note & { children?: NoteNode[] };

interface Props {
    note: NoteNode;
    currentId?: number;
    depth?: number;
}

export default function SidebarNoteItem({ note, currentId, depth = 0 }: Props) {
    const isActive = note.id === currentId;
    const [expanded, setExpanded] = useState(false);
    const hasChildren = note.children && note.children.length > 0;

    return (
        <div>
            <div
                className="group flex items-center gap-2 rounded-lg mx-1 cursor-pointer select-none min-h-11 transition-colors duration-100"
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
                    prefetch
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
                            { preserveScroll: false },
                        );
                    }}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    aria-label="Delete note"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {hasChildren && expanded && (
                <div>
                    {note.children!.map((child) => (
                        <SidebarNoteItem
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
