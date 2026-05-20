import "@blocknote/mantine/style.css";

import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    useCreateBlockNote,
} from "@blocknote/react";
import { useCallback } from "react";

interface Props {
    initialContent?: object[] | null;
    onChange: (content: object[]) => void;
    editable?: boolean;
}

export default function NoteEditor({
    initialContent,
    onChange,
    editable = true,
}: Props) {
    const isDark =
        typeof document !== "undefined"
            ? document.documentElement.classList.contains("dark")
            : false;

    const editor = useCreateBlockNote({
        initialContent:
            initialContent && initialContent.length > 0
                ? (initialContent as PartialBlock[])
                : undefined,
    });

    const handleChange = useCallback(() => {
        onChange(editor.document as object[]);
    }, [editor, onChange]);

    return (
        <div className="blocknote-wrapper w-full">
            <BlockNoteView
                editor={editor}
                theme={isDark ? "dark" : "light"}
                onChange={handleChange}
                editable={editable}
                slashMenu={false}
            >
                <SuggestionMenuController
                    triggerCharacter="/"
                    getItems={async (query) => {
                        const items = getDefaultReactSlashMenuItems(editor);
                        return items.filter(
                            (item) =>
                                !query ||
                                item.title
                                    .toLowerCase()
                                    .includes(query.toLowerCase()),
                        );
                    }}
                />
            </BlockNoteView>
        </div>
    );
}
