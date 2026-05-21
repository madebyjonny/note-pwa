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
import AppLayout, { useHeaderActions } from "@/Layouts/AppLayout";
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

    // Listen for real-time updates and deletions from other sessions
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`notes.${auth.user.id}`);
        channel.listen(".NoteUpdated", (e: { id: number; title: string }) => {
            if (e.id === note.id) {
                setTitle(e.title);
            }
        });
        channel.listen(".NoteDeleted", (e: { id: number }) => {
            if (e.id === note.id) {
                router.visit(route("notes.index"));
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

    const setHeaderActions = useHeaderActions();

    const handleDelete = useCallback(() => {
        router.delete(route("notes.destroy", { note: note.id }));
    }, [note.id]);

    const handleTogglePin = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.patch(
            route("notes.update", { note: note.id }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { is_pinned: !note.is_pinned } as any,
            { preserveScroll: true, preserveState: false },
        );
    }, [note.id, note.is_pinned]);

    // Inject pin/delete/saving actions into AppLayout's navigation bar
    useEffect(() => {
        setHeaderActions(
            <div className="flex items-center gap-0.5 pr-1">
                <AnimatePresence>
                    {saving && (
                        <motion.span
                            key="saving"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs px-2"
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
                            className="text-xs px-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Saved
                        </motion.span>
                    )}
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleTogglePin}
                    className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
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
                    {note.is_pinned ? <Pin size={22} /> : <PinOff size={22} />}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleDelete}
                    className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
                    style={{ color: "var(--color-text-secondary)" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                        e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color =
                            "var(--color-text-secondary)";
                    }}
                    title="Delete note"
                >
                    <Trash2 size={22} />
                </motion.button>
            </div>,
        );
        return () => setHeaderActions(null);
    }, [
        note.is_pinned,
        saving,
        saved,
        handleTogglePin,
        handleDelete,
        setHeaderActions,
    ]);

    // Auto-resize title textarea
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = "auto";
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [title]);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pt-6 pb-32 md:px-10 md:pt-8">
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
                    className="w-full resize-none overflow-hidden bg-transparent outline-none text-2xl font-bold leading-tight placeholder:opacity-20 md:text-4xl"
                    style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-family-sans)",
                        fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
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
