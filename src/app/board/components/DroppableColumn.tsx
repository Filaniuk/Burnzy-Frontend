"use client";

import { useDroppable } from "@dnd-kit/core";

export default function DroppableColumn({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[80px]">
      {children}
    </div>
  );
}
