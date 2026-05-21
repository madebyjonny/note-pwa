import { lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout, { useHeaderActions } from "@/Layouts/AppLayout";
import NoteHeaderActions from "@/Components/NoteHeaderActions";
import NoteTitle from "@/Components/NoteTitle";
import { Note } from "@/types";
import { useNoteViewModel } from "./useNoteViewModel";

const NoteEditor = lazy(() => import("@/Components/NoteEditor"));

interface Props {
    note: Note;
}

export default function Show({ note }: Props) {
    const vm = useNoteViewModel(note);
    const setHeaderActions = useHeaderActions();

    useEffect(() => {
        setHeaderActions(
            <NoteHeaderActions
                saving={vm.saving}
                saved={vm.saved}
                isPinned={note.is_pinned}
                onTogglePin={vm.handleTogglePin}
                onDelete={vm.handleDelete}
            />,
        );
        return () => setHeaderActions(null);
    }, [
        note.is_pinned,
        vm.saving,
        vm.saved,
        vm.handleTogglePin,
        vm.handleDelete,
        setHeaderActions,
    ]);

    if (vm.deleting) return null;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pt-6 pb-32 md:px-10 md:pt-8">
            <NoteTitle
                value={vm.title}
                onChange={vm.handleTitleChange}
                onKeyDown={vm.handleTitleKeyDown}
            />

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
                        onChange={vm.handleContentChange}
                    />
                </Suspense>
            </motion.div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

Show.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
