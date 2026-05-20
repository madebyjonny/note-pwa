import AppLayout from "@/Layouts/AppLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
                <h1
                    className="text-2xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Settings
                </h1>

                <div
                    className="rounded-lg border p-6 space-y-1"
                    style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-editor-bg)",
                    }}
                >
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div
                    className="rounded-lg border p-6"
                    style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-editor-bg)",
                    }}
                >
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div
                    className="rounded-lg border p-6"
                    style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-editor-bg)",
                    }}
                >
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}

Edit.layout = (page: React.ReactNode) => page;
