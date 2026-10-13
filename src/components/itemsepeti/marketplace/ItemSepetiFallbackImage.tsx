"use client";

import React, { useState } from "react";

interface FallbackImageProps {
  src?: string | null;
  alt: string;
  gameName: string;
  categoryName?: string;
  className?: string;
  containerClassName?: string;
}

export default function ItemSepetiFallbackImage({
  src,
  alt,
  gameName,
  categoryName,
  className = "w-full h-full object-cover",
  containerClassName = "relative w-full h-full overflow-hidden flex items-center justify-center",
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  const showImage = Boolean(src) && !error;

  return (
    <div className={containerClassName}>
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          onError={() => setError(true)}
          className={className}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F7F8FA] dark:bg-[#181C22] select-none">
          <span className="w-12 h-12 rounded-full bg-[#0F625C]/10 dark:bg-[#168B83]/20 border border-[#0F625C]/20 dark:border-[#168B83]/40 flex items-center justify-center text-[#0F625C] dark:text-[#168B83] font-black text-sm mb-1.5 shadow-xs">
            {gameName ? gameName.substring(0, 2).toUpperCase() : "IS"}
          </span>
          <span className="text-xs font-bold text-[#15191E] dark:text-[#EDEEF2] line-clamp-1">
            {gameName || "İtemSepeti"}
          </span>
          {categoryName && (
            <span className="text-[10px] text-[#69717D] dark:text-[#8E97A4] font-medium line-clamp-1">
              {categoryName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
