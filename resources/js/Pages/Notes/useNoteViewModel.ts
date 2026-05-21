import { router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Note, PageProps } from "@/types";

const AUTOSAVE_DELAY = 1200;

export interface NoteViewModel {
    title: string;
    saving: boolean;
    saved: boolean;
    deleting: boolean;
    handleTitleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleTitleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleContentChange: (content: object[]) => void;
    handleDelete: () => void;
    handleTogglePin: () => void;
}

export function useNoteViewModel(note: Note): NoteViewModel {
    const { auth } = usePage<PageProps>().props;

    const [title, setTitle] = useState(note.title || "");
    const [content, setContent] = useState<object[] | null>(note.content);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const saveTimer = useRef<ReturnType<typeof setTimeout>>();

    // Reset all transient state when navigating to a different note.
    // Inertia reuses the component instance across same-component navigations
    // (persistent layout), so useState values from the previous note survive.
    useEffect(() => {
        clearTimeout(saveTimer.current);
        setDeleting(false);
        setTitle(note.title || "");
        setContent(note.content);
        setSaving(false);
        setSaved(false);
    }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Real-time updates and deletions from other sessions via Echo
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`notes.${auth.user.id}`);

        channel.listen(".NoteUpdated", (e: { id: number; title: string }) => {
            if (e.id === note.id) setTitle(e.title);
        });

        channel.listen(".NoteDeleted", (e: { id: number }) => {
            if (e.id === note.id) router.visit(route("notes.index"));
        });

        return () => window.Echo.leave(`notes.${auth.user.id}`);
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
            document.querySelector<HTMLElement>(".bn-editor")?.focus();
        }
    };

    const handleDelete = useCallback(() => {
        clearTimeout(saveTimer.current);
        setDeleting(true);
        router.delete(route("notes.destroy", { note: note.id }), {
            onError: () => setDeleting(false),
        });
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

    // Auto-resize is handled inside NoteTitle itself.

    return {
        title,
        saving,
        saved,
        deleting,
        handleTitleChange,
        handleTitleKeyDown,
        handleContentChange,
        handleDelete,
        handleTogglePin,
    };
}
