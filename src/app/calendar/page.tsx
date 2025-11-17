// app/calendar/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import type { Draggable as FCDraggable } from "@fullcalendar/interaction";

import { apiFetch } from "@/lib/api";
import ScheduleModal from "./components/ScheduleModal";
import EventModal from "./components/EventModal";
import CalendarSidebar from "./components/CalendarSidebar";
import CalendarView from "./components/CalendarView";
import {
  BrandEvent,
  CalendarIdea,
  IdeaStatus,
  getEventColors,
  EventDropArg,
  ExternalDropArg,
  EventClickArg,
} from "@/types/calendar";
import ConfirmModal from "../pricing/components/ConfirmModal";

export default function CalendarPage() {
  const [events, setEvents] = useState<BrandEvent[]>([]);
  const [unscheduled, setUnscheduled] = useState<CalendarIdea[]>([]);
  const [filming, setFilming] = useState<CalendarIdea[]>([]);
  const [publishing, setPublishing] = useState<CalendarIdea[]>([]);
  const [published, setPublished] = useState<CalendarIdea[]>([]);
  const [archived, setArchived] = useState<CalendarIdea[]>([]);
  const [calendarMeta, setCalendarMeta] = useState<any>()
  const [modalType, setModalType] =
    useState<"schedule" | "event" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [cancelAction, setCancelAction] = useState<() => void>(() => { });
  const [confirmMessage, setConfirmMessage] = useState({
    title: "",
    description: "",
    button: "OK",
    color: "yellow" as "red" | "yellow" | "green",
  });

  const [activeIdeaId, setActiveIdeaId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const draggableRef = useRef<FCDraggable | null>(null);

  // --------------------------
  // Helpers
  // --------------------------
  function isPast(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr).getTime() < today.getTime();
  }

  function openConfirmModal({
    title,
    description,
    confirmText = "OK",
    color = "yellow",
    onConfirm,
    onCancel,
  }: {
    title: string;
    description: string;
    confirmText?: string;
    color?: "red" | "yellow" | "green";
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    setConfirmMessage({ title, description, button: confirmText, color });
    setConfirmAction(() => onConfirm);
    setCancelAction(() => onCancel);
    setShowConfirm(true);
  }


  // --------------------------
  // Unified load()
  // --------------------------
  const load = useCallback(async () => {
    const res = await apiFetch("/api/v1/calendar");
    setCalendarMeta(res.meta)
    const scheduled: CalendarIdea[] = res.data.scheduled;
    const unsched: CalendarIdea[] = res.data.unscheduled;

    setUnscheduled(unsched);

    const film: CalendarIdea[] = [];
    const toPublish: CalendarIdea[] = [];
    const publishedIdeas: CalendarIdea[] = [];
    const archivedIdeas: CalendarIdea[] = [];
    const mappedEvents: BrandEvent[] = [];

    for (const idea of scheduled) {
      const status = idea.status as IdeaStatus;

      // Bucket for sidebar
      if (status === "to_film") {
        film.push(idea);
      } else if (status === "to_publish") {
        toPublish.push(idea);
      } else if (status === "published") {
        publishedIdeas.push(idea);
      } else if (status === "archived") {
        archivedIdeas.push(idea);
      }

      // Calendar event (no archived in calendar)
      if (idea.scheduled_for && status !== "unassigned") {
        const colors = getEventColors(status);

        mappedEvents.push({
          id: `idea-${idea.id}`,
          title: idea.title,
          date: idea.scheduled_for,
          ...colors,
          extendedProps: {
            idea_id: idea.id,
            status,
          },
        });
      }
    }

    setFilming(film);
    setPublishing(toPublish);
    setPublished(publishedIdeas);
    setArchived(archivedIdeas);
    setEvents(mappedEvents);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --------------------------
  // Enable drag from "Unscheduled"
  // --------------------------
  useEffect(() => {
    if (!sidebarRef.current) return;

    if (draggableRef.current) {
      draggableRef.current.destroy();
    }

    draggableRef.current = new Draggable(sidebarRef.current, {
      itemSelector: ".unscheduled-card",
      eventData: (el: HTMLElement) => ({
        title: el.getAttribute("data-title") || "",
        extendedProps: {
          idea_id: Number(el.getAttribute("data-id")),
        },
      }),
    });

    return () => {
      if (draggableRef.current) {
        draggableRef.current.destroy();
        draggableRef.current = null;
      }
    };
  }, [unscheduled]);

  // --------------------------
  // Event drag within calendar (move date, keep status)
  // --------------------------
  function handleEventDrop(info: EventDropArg) {
    const dateStr: string = info.event.startStr;
    if (isPast(dateStr)) {
      openConfirmModal({
        title: "Invalid Date",
        description: "You cannot schedule or move content into the past.",
        confirmText: "Okay",
        color: "yellow",
        onConfirm: () => {
          info.revert();
          setShowConfirm(false);
        },
        onCancel: () => {
          info.revert();
          setShowConfirm(false);
        },
      });
      return;
    }


    const ideaId = info.event.extendedProps.idea_id as number;
    const status = info.event.extendedProps.status as IdeaStatus;

    apiFetch("/api/v1/calendar/schedule", {
      method: "POST",
      body: JSON.stringify({
        idea_id: ideaId,
        date: dateStr,
        status,
      }),
    }).then(() => load());
  }

  // --------------------------
  // Drop from sidebar → calendar
  // --------------------------
  function handleExternalDrop(info: ExternalDropArg) {
    const dateStr: string = info.dateStr;
    if (isPast(dateStr)) {
      openConfirmModal({
        title: "Cannot Schedule in the Past",
        description: "Pick a date today or in the future.",
        confirmText: "Got it",
        color: "yellow",
        onConfirm: () => setShowConfirm(false),
        onCancel: () => setShowConfirm(false),
      });
      return;
    }


    const id =
      info.draggedEl?.getAttribute("data-id") ||
      info.event?.extendedProps?.idea_id;

    setModalType("schedule");
    setActiveIdeaId(Number(id));
    setScheduleDate(dateStr);
  }

  // --------------------------
  // Click existing event → Event modal
  // --------------------------
  function handleEventClick(info: EventClickArg) {
    const ideaId = info.event.extendedProps.idea_id as number;
    setModalType("event");
    setActiveIdeaId(ideaId);
  }

  // --------------------------
  // Upcoming list
  // --------------------------
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextFive = sortedEvents.slice(0, 5);

  return (
    <div
      className="flex min-h-[calc(100vh-80px)] gap-6 text-white"
      style={{ background: "#0F0E17" }}
    >
      <CalendarSidebar
        sidebarRef={sidebarRef}
        meta={calendarMeta}
        unscheduled={unscheduled}
        filming={filming}
        publishing={publishing}
        published={published}
        archived={archived}
        nextFive={nextFive}
      />

      <CalendarView
        events={events}
        onEventDrop={handleEventDrop}
        onExternalDrop={handleExternalDrop}
        onEventClick={handleEventClick}
      />

      {/* MODALS */}
      {modalType === "schedule" && (
        <ScheduleModal
          close={() => setModalType(null)}
          date={scheduleDate}
          ideaId={activeIdeaId}
          reload={load}
        />
      )}

      {modalType === "event" && (
        <EventModal
          close={() => setModalType(null)}
          ideaId={activeIdeaId}
          reload={load}
        />
      )}

      <ConfirmModal
        show={showConfirm}
        title={confirmMessage.title}
        description={confirmMessage.description}
        confirmText={confirmMessage.button}
        confirmColor={confirmMessage.color}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </div>
  );
}
