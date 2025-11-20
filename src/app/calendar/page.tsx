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
  // -----------------------------
  // STATE
  // -----------------------------
  const [events, setEvents] = useState<BrandEvent[]>([]);
  const [unscheduled, setUnscheduled] = useState<CalendarIdea[]>([]);
  const [filming, setFilming] = useState<CalendarIdea[]>([]);
  const [publishing, setPublishing] = useState<CalendarIdea[]>([]);
  const [published, setPublished] = useState<CalendarIdea[]>([]);
  const [archived, setArchived] = useState<CalendarIdea[]>([]);
  const [calendarMeta, setCalendarMeta] = useState<any>();

  const [modalType, setModalType] = useState<"schedule" | "event" | null>(null);
  const [activeIdeaId, setActiveIdeaId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [cancelAction, setCancelAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState({
    title: "",
    description: "",
    button: "OK",
    color: "yellow" as "red" | "yellow" | "green",
  });

  // -----------------------------
  // REFS
  // -----------------------------
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const draggableRef = useRef<FCDraggable | null>(null);

  // -----------------------------
  // UTILS
  // -----------------------------
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

  // -----------------------------
  // LOAD CALENDAR DATA
  // -----------------------------
  const load = useCallback(async () => {
    const res = await apiFetch("/api/v1/calendar");
    setCalendarMeta(res.meta);

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

      if (status === "to_film") film.push(idea);
      else if (status === "to_publish") toPublish.push(idea);
      else if (status === "published") publishedIdeas.push(idea);
      else if (status === "archived") archivedIdeas.push(idea);

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

  // -----------------------------
  // ENABLE DRAGGING FROM SIDEBAR
  // -----------------------------
  useEffect(() => {
    if (!sidebarRef.current) return;

    if (draggableRef.current) draggableRef.current.destroy();

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
      draggableRef.current?.destroy();
      draggableRef.current = null;
    };
  }, [unscheduled]);

  // -----------------------------
  // EVENT MOVED INSIDE CALENDAR
  // -----------------------------
  function handleEventDrop(info: EventDropArg) {
    const dateStr = info.event.startStr;

    if (isPast(dateStr)) {
      openConfirmModal({
        title: "Invalid Date",
        description: "You cannot schedule content in the past.",
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

    apiFetch("/api/v1/calendar/schedule", {
      method: "POST",
      body: JSON.stringify({
        idea_id: info.event.extendedProps.idea_id,
        date: dateStr,
        status: info.event.extendedProps.status,
      }),
    }).then(() => load());
  }

  // -----------------------------
  // DROPPED FROM SIDEBAR → CALENDAR
  // -----------------------------
  function handleExternalDrop(info: ExternalDropArg) {
    const dateStr = info.dateStr;

    if (isPast(dateStr)) {
      openConfirmModal({
        title: "Cannot Schedule in the Past",
        description: "Pick a date today or in the future.",
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

  // -----------------------------
  // CLICK EVENT → OPEN MODAL
  // -----------------------------
  function handleEventClick(info: EventClickArg) {
    setModalType("event");
    setActiveIdeaId(info.event.extendedProps.idea_id);
  }

  // -----------------------------
  // DELETE IDEA FROM SIDEBAR
  // -----------------------------
  const handleDeleteIdea = (id: number) => {
    setUnscheduled((prev) => prev.filter((i) => i.id !== id));
    setFilming((prev) => prev.filter((i) => i.id !== id));
    setPublishing((prev) => prev.filter((i) => i.id !== id));
    setPublished((prev) => prev.filter((i) => i.id !== id));
    setArchived((prev) => prev.filter((i) => i.id !== id));
    setEvents((prev) => prev.filter((e) => e.extendedProps.idea_id !== id));
  };

  // -----------------------------
  // UPCOMING 5 EVENTS
  // -----------------------------
  const nextFive = [...events]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5);

  // -----------------------------
  // RENDER PAGE
  // -----------------------------
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
        onDeleteIdea={handleDeleteIdea}
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
