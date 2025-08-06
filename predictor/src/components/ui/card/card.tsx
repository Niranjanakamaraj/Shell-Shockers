// src/components/ui/card.tsx
import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: "1.25rem" }}>{children}</h2>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "0.875rem", color: "#666" }}>{children}</p>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}