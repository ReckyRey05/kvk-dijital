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
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-black/5 to-black/20 dark:from-black/60 dark:to-black/90 select-none">
          <span className="w-12 h-12 rounded-full bg-[#D99532]/20 border border-[#D99532]/30 flex items-center justify-center text-[#D99532] font-black text-sm mb-1.5 shadow-inner">
            {gameName ? gameName.substring(0, 2).toUpperCase() : "IS"}
          </span>
          <span className="text-xs font-bold text-[#17191F] dark:text-white/90 line-clamp-1">
            {gameName || "İtemSepeti"}
          </span>
          {categoryName && (
            <span className="text-[10px] text-[#626772] dark:text-[#9498A6] line-clamp-1">
              {categoryName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
