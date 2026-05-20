import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { FormEventHandler } from "react";

export default function Setup() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("setup.store"));
    };

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center p-4"
            style={{ background: "var(--color-editor-bg)" }}
        >
            <Head title="Welcome to Notes" />

            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--color-text-primary)" }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="128"
                            y="128"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="186"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="244"
                            width="196"
                            height="20"
                            rx="10"
                            fill="white"
                            opacity="0.6"
                        />
                        <rect
                            x="128"
                            y="302"
                            width="256"
                            height="20"
                            rx="10"
                            fill="white"
                        />
                        <rect
                            x="128"
                            y="360"
                            width="156"
                            height="20"
                            rx="10"
                            fill="white"
                            opacity="0.6"
                        />
                    </svg>
                </div>
                <span
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Notes
                </span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-sm rounded-xl border p-8"
                style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-sidebar-bg)",
                }}
            >
                <div className="mb-6">
                    <h1
                        className="text-lg font-semibold mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Welcome — let's get you set up
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Create your account to start using Notes. This only
                        needs to happen once.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Your name" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="email"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                            autoComplete="new-password"
                        />
                        <InputError
                            message={errors.password}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm password"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            required
                            autoComplete="new-password"
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={processing}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                        style={{
                            background: "var(--color-text-primary)",
                            color: "var(--color-editor-bg)",
                        }}
                    >
                        {processing
                            ? "Creating account…"
                            : "Create account & continue"}
                    </motion.button>
                </form>
            </motion.div>

            <p
                className="mt-6 text-xs"
                style={{ color: "var(--color-text-secondary)" }}
            >
                This page is only visible once, before any account exists.
            </p>
        </div>
    );
}
