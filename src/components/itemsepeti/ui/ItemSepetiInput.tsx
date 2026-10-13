import React, { InputHTMLAttributes, forwardRef } from "react";

export interface ItemSepetiInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const ItemSepetiInput = forwardRef<HTMLInputElement, ItemSepetiInputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = "", id, disabled, style, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-inherit">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-inherit opacity-90 select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3 flex items-center justify-center text-[#9498A6] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full h-11 px-3.5 ${leftIcon ? "pl-10" : ""} ${
              rightElement ? "pr-10" : ""
            } rounded-[8px] text-sm bg-white dark:bg-black/25 border border-[#E5E8EB] dark:border-[#2A313C] text-[#15191E] dark:text-[#EDEEF2] placeholder:text-[#8D96A3] focus:outline-none focus:ring-2 focus:ring-[#0F625C] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? "border-[#EF4444] focus:ring-[#EF4444]" : ""
            } ${className}`}
            style={style}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center justify-center text-[#9498A6]">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#F87171] font-medium mt-0.5">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#9498A6] mt-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

ItemSepetiInput.displayName = "ItemSepetiInput";

export default ItemSepetiInput;
