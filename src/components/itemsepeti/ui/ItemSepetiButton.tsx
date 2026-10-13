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
  // Purposeful design token radiuses: 8px for buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-[8px] transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeClasses = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const variantStyles: Record<ItemSepetiButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "#0F625C",
      color: "#FFFFFF",
      fontWeight: 600,
    },
    secondary: {
      backgroundColor: "rgba(105, 113, 125, 0.08)",
      color: "inherit",
      border: "1px solid rgba(105, 113, 125, 0.2)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "inherit",
    },
    danger: {
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      color: "#EF4444",
      border: "1px solid rgba(239, 68, 68, 0.25)",
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
