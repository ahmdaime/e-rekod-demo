"use client";

import React, { useState, useEffect, useRef } from "react";

interface DebouncedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value: externalValue,
  onDebouncedChange,
  delay = 500,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Sync from external value when user is not typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    isTypingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onDebouncedChange(newValue);
    }, delay);
  };

  return <input {...props} value={localValue} onChange={handleChange} />;
};
