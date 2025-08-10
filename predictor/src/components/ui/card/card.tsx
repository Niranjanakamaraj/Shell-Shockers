// src/components/ui/card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({ children, className = "" }: CardProps) {
  return <h2 className={className}>{children}</h2>;
}

export function CardDescription({ children, className = "" }: CardProps) {
  return <p className={className}>{children}</p>;
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
}