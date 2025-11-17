import IdeaCard from "./IdeaCard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({
  idea,
  tag,
  version,
  onDelete,
}: {
  idea: any;
  tag: string | null;
  version: number | null;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
    >
      <IdeaCard
        idea={idea}
        tag={tag}
        version={version}
        onDelete={onDelete}
        dragOverlay={isDragging}
      />
    </div>
  );
}
