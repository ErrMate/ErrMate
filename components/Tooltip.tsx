"use client";

import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, text, position = "top" }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-3",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-3",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-3",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 -mt-1",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 -mb-1",
    left: "left-full top-1/2 transform -translate-y-1/2 -ml-1",
    right: "right-full top-1/2 transform -translate-y-1/2 -mr-1",
  };

  const arrowRotations = {
    top: "rotate-45",
    bottom: "rotate-45",
    left: "rotate-45",
    right: "rotate-45",
  };

  return (
    <div className="relative group">
      {children}
      <div
        className={`absolute ${positionClasses[position]} px-4 py-2.5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl transform group-hover:scale-100 scale-95`}
      >
        <div className="relative">
          {text}
          <div className={`absolute ${arrowClasses[position]}`}>
            <div className={`w-2.5 h-2.5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${arrowRotations[position]} shadow-lg`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

