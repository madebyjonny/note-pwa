import { AnimatePresence, motion } from "framer-motion";
import { Pin, PinOff, Trash2 } from "lucide-react";

interface Props {
    saving: boolean;
    saved: boolean;
    isPinned: boolean;
    onTogglePin: () => void;
    onDelete: () => void;
}

export default function NoteHeaderActions({
    saving,
    saved,
    isPinned,
    onTogglePin,
    onDelete,
}: Props) {
    return (
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
                onClick={onTogglePin}
                className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
                style={{
                    color: isPinned
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
                title={isPinned ? "Unpin" : "Pin"}
            >
                {isPinned ? <Pin size={22} /> : <PinOff size={22} />}
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onDelete}
                className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
                title="Delete note"
            >
                <Trash2 size={22} />
            </motion.button>
        </div>
    );
}
