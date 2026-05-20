import { ButtonHTMLAttributes } from "react";

export default function SecondaryButton({
    type = "button",
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition duration-150 ease-in-out focus:outline-none disabled:opacity-25 ${disabled && "opacity-25"} ` +
                className
            }
            style={{
                borderColor: "var(--color-border)",
                background: "var(--color-editor-bg)",
                color: "var(--color-text-primary)",
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
