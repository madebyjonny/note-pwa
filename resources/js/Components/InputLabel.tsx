import { LabelHTMLAttributes } from "react";

export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={`block text-xs font-medium mb-1 ${className}`}
            style={{ color: "var(--color-text-secondary)" }}
        >
            {value ? value : children}
        </label>
    );
}
