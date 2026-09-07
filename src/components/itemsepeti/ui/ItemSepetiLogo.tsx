import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export default function ItemSepetiLogo({ size = "md", className = "", href = "/itemsepeti" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  const badgeSizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* Clean, typographic wordmark without generic gaming/controller icons */}
      <span className={`font-black tracking-tight text-inherit flex items-baseline leading-none ${sizeClasses[size]}`}>
        <span>İtem</span>
        <span className="text-[#E8A33D] font-extrabold ml-0.5">Sepeti</span>
      </span>

      {/* Subtle marketplace role badge */}
      <span
        className={`font-semibold rounded-[6px] tracking-wide uppercase leading-none border transition-colors ${badgeSizeClasses[size]}`}
        style={{
          backgroundColor: "rgba(232, 163, 61, 0.12)",
          borderColor: "rgba(232, 163, 61, 0.25)",
          color: "#E8A33D",
        }}
      >
        Pazar
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="İtemSepeti Ana Sayfa" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D] rounded-[8px]">
        {content}
      </Link>
    );
  }

  return content;
}
