import { Search } from "lucide-react";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function SidebarSearch({ value, onChange }: Props) {
    return (
        <div className="px-2 pt-1 pb-0.5">
            <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                style={{
                    background: "var(--color-sidebar-active)",
                    border: "1px solid var(--color-border)",
                }}
            >
                <Search
                    size={14}
                    style={{
                        color: "var(--color-text-secondary)",
                        flexShrink: 0,
                    }}
                />
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && onChange("")}
                    className="w-full bg-transparent outline-none text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                />
            </div>
        </div>
    );
}
