import { router, useForm, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Pin, PinOff, Trash2 } from "lucide-react";
import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Note, PageProps } from "@/types";

// Lazy load the editor to avoid SSR issues with BlockNote
const NoteEditor = lazy(() => import("@/Components/NoteEditor"));

interface Props {
    note: Note;
}

const AUTOSAVE_DELAY = 1200;

export default function Show({ note }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [title, setTitle] = useState(note.title || "");
    const [content, setContent] = useState<object[] | null>(note.content);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>();
    const titleRef = useRef<HTMLTextAreaElement>(null);

    // Listen for real-time updates from other sessions
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`notes.${auth.user.id}`);
        channel.listen(".NoteUpdated", (e: { id: number; title: string }) => {
            if (e.id === note.id) {
                setTitle(e.title);
            }
        });

        return () => {
            window.Echo.leave(`notes.${auth.user.id}`);
        };
    }, [auth.user.id, note.id]);

    const save = useCallback(
        (newTitle: string, newContent: object[] | null) => {
            setSaving(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            router.patch(
                route("notes.update", { note: note.id }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { title: newTitle, content: newContent } as any,
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setSaving(false);
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                    },
                    onError: () => setSaving(false),
                },
            );
        },
        [note.id],
    );

    const scheduleAutosave = useCallback(
        (newTitle: string, newContent: object[] | null) => {
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(
                () => save(newTitle, newContent),
                AUTOSAVE_DELAY,
            );
        },
        [save],
    );

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        scheduleAutosave(e.target.value, content);
    };

    const handleContentChange = useCallback(
        (newContent: object[]) => {
            setContent(newContent);
            scheduleAutosave(title, newContent);
        },
        [title, scheduleAutosave],
    );

    const handleTitleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            // Focus the editor on Enter in title
            document.querySelector<HTMLElement>(".bn-editor")?.focus();
        }
    };

    const handleDelete = () => {
        router.delete(route("notes.destroy", { note: note.id }));
    };

    const handleTogglePin = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.patch(
            route("notes.update", { note: note.id }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { is_pinned: !note.is_pinned } as any,
            { preserveScroll: true, preserveState: false },
        );
    };

    // Auto-resize title textarea
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = "auto";
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [title]);

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 pb-32 w-full">
            {/* Toolbar */}
            <div className="flex items-center justify-end gap-1 mb-6 h-8">
                <AnimatePresence>
                    {saving && (
                        <motion.span
                            key="saving"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs mr-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Saving...
                        </motion.span>
                    )}
                    {saved && !saving && (
                        <motion.span
                            key="saved"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs mr-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Saved
                        </motion.span>
                    )}
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleTogglePin}
                    className="p-1.5 rounded-md transition-colors cursor-pointer"
                    style={{
                        color: note.is_pinned
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "var(--color-sidebar-hover)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                    title={note.is_pinned ? "Unpin" : "Pin"}
                >
                    {note.is_pinned ? <Pin size={14} /> : <PinOff size={14} />}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-1.5 rounded-md transition-colors cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) => (
                        (e.currentTarget.style.background = "#fee2e2"),
                        (e.currentTarget.style.color = "#ef4444")
                    )}
                    onMouseLeave={(e) => (
                        (e.currentTarget.style.background = "transparent"),
                        (e.currentTarget.style.color =
                            "var(--color-text-secondary)")
                    )}
                    title="Delete note"
                >
                    <Trash2 size={14} />
                </motion.button>
            </div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <textarea
                    ref={titleRef}
                    value={title}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeyDown}
                    placeholder="Untitled"
                    rows={1}
                    className="w-full resize-none overflow-hidden bg-transparent outline-none text-4xl font-bold leading-tight placeholder:opacity-20"
                    style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-family-sans)",
                    }}
                />
            </motion.div>

            {/* Editor */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="mt-4"
            >
                <Suspense
                    fallback={
                        <div
                            className="py-4"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Loading editor...
                        </div>
                    }
                >
                    <NoteEditor
                        key={note.id}
                        initialContent={note.content}
                        onChange={handleContentChange}
                    />
                </Suspense>
            </motion.div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
