"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import LoadingAnalysis from "@/components/LoadingAnalysis";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import DroppableColumn from "./DroppableColumn";
import SortableItem from "./SortableItem";
import IdeaCard from "./IdeaCard";

const STATUS_COLUMNS = [
  { id: "new", label: "New", accent: "#6C63FF" },
  { id: "to_film", label: "To Film", accent: "#00F5A0" },
  { id: "in_production", label: "In Production", accent: "#F8E45C" },
  { id: "published", label: "Published", accent: "#FF6C6C" },
  { id: "archived", label: "Archived", accent: "#A1A1AA" },
] as const;

type ColumnId = (typeof STATUS_COLUMNS)[number]["id"];

export default function KanbanBoard() {
  const [board, setBoard] = useState<any>({
    new: [],
    to_film: [],
    in_production: [],
    published: [],
    archived: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeIdea, setActiveIdea] = useState<any>(null);
  const [metaTag, setMetaTag] = useState<string | null>(null);
  const [metaVersion, setMetaVersion] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/ideas/kanban");
      setBoard(res.data);
      setMetaTag(res.meta?.tag || null);
      setMetaVersion(res.meta?.version || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  async function updateStatus(id: number, status: ColumnId) {
    try {
      await apiFetch("/api/v1/ideas/update_status", {
        method: "POST",
        body: JSON.stringify({ idea_id: id, status }),
      });
    } catch (e) {
      console.error(e);
      loadBoard();
    }
  }

  function handleDelete(id: number) {
    setBoard((prev: any) => {
      const updated = { ...prev };

      for (const col of Object.keys(updated)) {
        updated[col] = updated[col].filter((i: any) => i.id !== id);
      }

      return updated;
    });
  }


  function handleDragStart(event: any) {
    const { active } = event;
    const idea = Object.values(board).flat().find((i: any) => i.id === active.id);
    setActiveIdea(idea ?? null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveIdea(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let sourceCol: ColumnId | null = null;
    let destCol: ColumnId | null = null;

    for (const col of STATUS_COLUMNS) {
      if (board[col.id].some((i: any) => i.id === activeId)) {
        sourceCol = col.id;
      }
      if (board[col.id].some((i: any) => i.id === overId)) {
        destCol = col.id;
      }
    }

    if (STATUS_COLUMNS.some((c) => c.id === overId)) {
      destCol = overId as ColumnId;
    }

    if (!sourceCol || !destCol) return;

    if (sourceCol === destCol) {
      const oldIndex = board[sourceCol].findIndex((i: any) => i.id === activeId);
      const newIndex = board[sourceCol].findIndex((i: any) => i.id === overId);

      setBoard((prev: any) => ({
        ...prev,
        [sourceCol]: arrayMove(prev[sourceCol], oldIndex, newIndex),
      }));

      return;
    }

    const movedIdea = board[sourceCol].find((i: any) => i.id === activeId);

    setBoard((prev: any) => ({
      ...prev,
      [sourceCol]: prev[sourceCol].filter((i: any) => i.id !== activeId),
      [destCol]: [{ ...movedIdea, status: destCol }, ...prev[destCol]],
    }));

    updateStatus(activeId, destCol);
  }

  if (loading) return <LoadingAnalysis message="Loading Board..." />;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {STATUS_COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex flex-col bg-[#13121C] border border-[#2A2935] rounded-2xl shadow-lg"
          >
            <div className="px-4 py-3 border-b border-[#2A2935] bg-[#16151E]/60 flex justify-between items-center sticky top-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.accent }}
                />
                <span className="font-semibold">{col.label}</span>
              </div>

              <span className="text-xs text-neutral-400">
                {board[col.id].length}
              </span>
            </div>

            <DroppableColumn columnId={col.id}>
              <SortableContext
                items={board[col.id].map((i: any) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {board[col.id].length === 0 && (
                  <div className="text-neutral-500 text-xs text-center py-6 italic">
                    Drop ideas here
                  </div>
                )}

                {board[col.id].map((idea: any) => (
                  <SortableItem
                    key={idea.id}
                    idea={idea}
                    tag={metaTag}
                    version={metaVersion}
                    onDelete={handleDelete}
                  />
                ))}

              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeIdea && <IdeaCard idea={activeIdea} dragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
