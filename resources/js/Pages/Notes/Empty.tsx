import { router } from "@inertiajs/react";
import { Plus } from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";

export default function Empty() {
    return (
        <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ color: "var(--color-text-secondary)" }}
        >
            <p className="text-sm">No notes yet</p>
            <button
                onClick={() => router.get(route("notes.create"))}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{
                    background: "var(--color-sidebar-active)",
                    color: "var(--color-text-primary)",
                }}
            >
                <Plus size={16} />
                New note
            </button>
        </div>
    );
}

Empty.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
