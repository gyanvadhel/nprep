"use client";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode } from "react";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  return (
    <Primitive.Root open={open} onOpenChange={onOpenChange}>
      <Primitive.Portal>
        <Primitive.Overlay className="dialog-overlay" />
        <Primitive.Content
          className={cn("dialog-content", className)}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            openerRef.current = document.activeElement as HTMLElement;
            titleRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            requestAnimationFrame(() => {
              if (openerRef.current?.isConnected) openerRef.current.focus();
              else document.getElementById("main-content")?.focus();
            });
          }}
        >
          <div className="dialog-heading">
            <div>
              <Primitive.Title ref={titleRef} tabIndex={-1}>
                {title}
              </Primitive.Title>
              <Primitive.Description>{description}</Primitive.Description>
            </div>
            <Primitive.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Primitive.Close>
          </div>
          {children}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
