// app/calendar/components/CalendarSidebar.tsx
"use client";

import { RefObject, useState } from "react";
import IdeaCard from "@/app/calendar/components/IdeaCard";
import { CalendarIdea, BrandEvent } from "@/types/calendar";
import SidebarSection from "./SidebarSection";
import UpcomingList from "./UpcomingList";

interface CalendarSidebarProps {
  sidebarRef: RefObject<HTMLDivElement>;
  unscheduled: CalendarIdea[];
  filming: CalendarIdea[];
  publishing: CalendarIdea[];
  published: CalendarIdea[];
  archived: CalendarIdea[];
  nextFive: BrandEvent[];
  meta: any;
  onDeleteIdea: (id: number) => void;
}

export default function CalendarSidebar({
  sidebarRef,
  unscheduled,
  filming,
  publishing,
  published,
  archived,
  nextFive,
  meta,
  onDeleteIdea
}: CalendarSidebarProps) {
  const [showUnscheduled, setShowUnscheduled] = useState(false);
  const [showFilming, setShowFilming] = useState(false);
  const [showPublishing, setShowPublishing] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  return (
    <div
      ref={sidebarRef}
      className="w-72 rounded-xl border border-[#1A1923] bg-[#13121C] p-4"
    >
      {/* Unassigned / Unscheduled */}
      <SidebarSection
        title="Unassigned Ideas"
        accent="white"
        count={unscheduled.length}
        open={showUnscheduled}
        onToggle={() => setShowUnscheduled((v) => !v)}
      >
        <div className="space-y-3">
          {unscheduled.map((idea) => (
            <div
              key={idea.id}
              className="unscheduled-card group cursor-grab rounded-xl border border-[#2E2D39] bg-[#1B1A24] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
              data-id={idea.id}
              data-title={idea.title}
            >
              <IdeaCard idea={idea as any} tag={meta.channel_tag} version={meta.version} onDelete={onDeleteIdea} />
            </div>
          ))}
          {unscheduled.length === 0 && (
            <p className="text-xs text-neutral-500">
              Nothing to schedule ✨
            </p>
          )}
        </div>
      </SidebarSection>

      {/* TO_FILM */}
      <SidebarSection
        title="Planned to Film"
        accent="purple"
        count={filming.length}
        open={showFilming}
        onToggle={() => setShowFilming((v) => !v)}
      >
        <div className="space-y-3">
          {filming.map((idea) => (
            <div key={idea.id} className="pointer-events-none opacity-85">
              <IdeaCard idea={idea as any} tag={meta.channel_tag} version={meta.version} onDelete={onDeleteIdea} />
            </div>
          ))}
          {filming.length === 0 && (
            <p className="text-xs text-neutral-500">
              Drag an idea to the calendar and mark it as "To film".
            </p>
          )}
        </div>
      </SidebarSection>

      {/* TO_PUBLISH */}
      <SidebarSection
        title="Planned to Publish"
        accent="green"
        count={publishing.length}
        open={showPublishing}
        onToggle={() => setShowPublishing((v) => !v)}
      >
        <div className="space-y-3">
          {publishing.map((idea) => (
            <div key={idea.id} className="pointer-events-none opacity-85">
              <IdeaCard idea={idea as any} tag={meta.channel_tag} version={meta.version} onDelete={onDeleteIdea}/>
            </div>
          ))}
          {publishing.length === 0 && (
            <p className="text-xs text-neutral-500">
              Schedule ideas as "To publish" to see them here.
            </p>
          )}
        </div>
      </SidebarSection>

      {/* PUBLISHED */}
      <SidebarSection
        title="Published Ideas"
        accent="white"
        count={published.length}
        open={showPublished}
        onToggle={() => setShowPublished((v) => !v)}
      >
        <div className="space-y-3">
          {published.map((idea) => (
            <div key={idea.id} className="pointer-events-none opacity-85">
              <IdeaCard idea={idea as any} tag={meta.channel_tag} version={meta.version} onDelete={onDeleteIdea}/>
            </div>
          ))}
          {published.length === 0 && (
            <p className="text-xs text-neutral-500">
              Mark ideas as Published to track your wins 🎉
            </p>
          )}
        </div>
      </SidebarSection>

      {/* ARCHIVED */}
      <SidebarSection
        title="Archived Ideas"
        accent="gray"
        count={archived.length}
        open={showArchived}
        onToggle={() => setShowArchived((v) => !v)}
      >
        <div className="space-y-3">
          {archived.map((idea) => (
            <div key={idea.id} className="pointer-events-none opacity-60">
              <IdeaCard idea={idea as any} tag={meta.channel_tag} version={meta.version} onDelete={onDeleteIdea}/>
            </div>
          ))}
          {archived.length === 0 && (
            <p className="text-xs text-neutral-500">
              Nothing in the archive yet.
            </p>
          )}
        </div>
      </SidebarSection>

      {/* Upcoming mini-timeline */}
      <UpcomingList events={nextFive} />
    </div>
  );
}
