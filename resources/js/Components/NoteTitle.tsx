import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function NoteTitle({ value, onChange, onKeyDown }: Props) {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Auto-resize to fit content
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <textarea
                ref={ref}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder="Untitled"
                rows={1}
                className="w-full resize-none overflow-hidden bg-transparent outline-none font-bold leading-tight placeholder:opacity-20"
                style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-family-sans)",
                    fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                }}
            />
        </motion.div>
    );
}
