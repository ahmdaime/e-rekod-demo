"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hover = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4",
        (onClick || hover) &&
          "cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={cn("pb-3 border-b border-gray-100 mb-4", className)}>
    {children}
  </div>
);

// Card Title
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={cn("font-bold text-lg text-gray-900", className)}>{children}</h3>
);

// Card Content
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={cn("", className)}>{children}</div>
);
