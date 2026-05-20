import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";

export default forwardRef(function TextInput(
    {
        type = "text",
        className = "",
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={`w-full px-3 py-2 text-sm rounded-md outline-none transition-colors ${className}`}
            style={{
                background: "var(--color-editor-bg)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
            }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor =
                    "var(--color-text-secondary)";
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                props.onBlur?.(e);
            }}
            ref={localRef}
        />
    );
});
