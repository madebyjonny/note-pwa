import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-opacity cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            disabled={disabled}
            style={{
                background: "var(--color-text-primary)",
                color: "var(--color-editor-bg)",
            }}
        >
            {children}
        </button>
    );
}
