import { HTMLAttributes } from "react";

export default function InputError({
    message,
    className = "",
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={`text-xs mt-1 text-red-500 ${className}`}>
            {message}
        </p>
    ) : null;
}
