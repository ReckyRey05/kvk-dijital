import React, { ButtonHTMLAttributes } from "react";

export type ItemSepetiButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ItemSepetiButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ItemSepetiButtonVariant;
  size?: ItemSepetiButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function ItemSepetiButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  // Purposeful design token radiuses: 10px for buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-[10px] transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeClasses = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const variantStyles: Record<ItemSepetiButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "#E8A33D",
      color: "#12141A",
      fontWeight: 600,
    },
    secondary: {
      backgroundColor: "rgba(148, 152, 166, 0.12)",
      color: "inherit",
      border: "1px solid rgba(148, 152, 166, 0.25)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "inherit",
    },
    danger: {
      backgroundColor: "rgba(248, 113, 113, 0.15)",
      color: "#F87171",
      border: "1px solid rgba(248, 113, 113, 0.3)",
    },
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
