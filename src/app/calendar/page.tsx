"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import type { Draggable as FCDraggable } from "@fullcalendar/interaction";

import { apiFetch, APIError } from "@/lib/api";
import ConfirmModal from "../pricing/components/ConfirmModal";
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

// Central reusable error formatter — consistent across app
const getErrorMessage = (err: any): string => {
  if (err instanceof APIError) return err.detail || err.message;
  if (err?.message) return err.message;
  return "Unexpected error occurred.";
};

export default function CalendarPage() {
  // -----------------------------------------------------
  // STATE
  // -----------------------------------------------------
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

  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [cancelAction, setCancelAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState({
    title: "",
    description: "",
    button: "OK",
    color: "yellow" as "red" | "yellow" | "green",
  });

  // -----------------------------------------------------
  // REFS
  // -----------------------------------------------------
  const sidebarRef = useRef<any>(null);
  const draggableRef = useRef<FCDraggable | null>(null);
  const loadingRef = useRef<true | false>(false); // Avoid duplicate loads

  // -----------------------------------------------------
  // UTILS
  // -----------------------------------------------------
  const isPast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr).getTime() < today.getTime();
  };

  const openConfirmModal = ({
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
  }) => {
    setConfirmMessage({ title, description, button: confirmText, color });
    setConfirmAction(() => onConfirm);
    setCancelAction(() => onCancel);
    setShowConfirm(true);
  };

  // -----------------------------------------------------
  // LOAD CALENDAR DATA (prod-safe)
  // -----------------------------------------------------
  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setLoading(true);

    try {
      const res = await apiFetch<any>("/api/v1/calendar");
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
        if (status === "to_publish") toPublish.push(idea);
        if (status === "published") publishedIdeas.push(idea);
        if (status === "archived") archivedIdeas.push(idea);

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
    } catch (err) {
      openConfirmModal({
        title: "Failed to load calendar",
        description: getErrorMessage(err),
        color: "red",
        onConfirm: () => setShowConfirm(false),
        onCancel: () => setShowConfirm(false),
      });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // -----------------------------------------------------
  // ENABLE DRAGGING FROM SIDEBAR
  // -----------------------------------------------------
  useEffect(() => {
    if (!sidebarRef.current) return;

    // Cleanup previous draggable
    draggableRef.current?.destroy();

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

  // -----------------------------------------------------
  // EVENT MOVED INSIDE CALENDAR
  // -----------------------------------------------------
  const handleEventDrop = async (info: EventDropArg) => {
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

    try {
      await apiFetch<any>("/api/v1/calendar/schedule", {
        method: "POST",
        body: JSON.stringify({
          idea_id: info.event.extendedProps.idea_id,
          date: dateStr,
          status: info.event.extendedProps.status,
        }),
      });
      load();
    } catch (err) {
      info.revert();
      openConfirmModal({
        title: "Failed to update schedule",
        description: getErrorMessage(err),
        color: "red",
        onConfirm: () => setShowConfirm(false),
        onCancel: () => setShowConfirm(false),
      });
    }
  };

  // -----------------------------------------------------
  // DROPPED FROM SIDEBAR → CALENDAR
  // -----------------------------------------------------
  const handleExternalDrop = (info: ExternalDropArg) => {
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
  };

  // -----------------------------------------------------
  // CLICK EVENT → OPEN DETAILS MODAL
  // -----------------------------------------------------
  const handleEventClick = (info: EventClickArg) => {
    setModalType("event");
    setActiveIdeaId(info.event.extendedProps.idea_id);
  };

  // -----------------------------------------------------
  // DELETE IDEA FROM SIDEBAR
  // -----------------------------------------------------
  const handleDeleteIdea = (id: number) => {
    setUnscheduled((p) => p.filter((i) => i.id !== id));
    setFilming((p) => p.filter((i) => i.id !== id));
    setPublishing((p) => p.filter((i) => i.id !== id));
    setPublished((p) => p.filter((i) => i.id !== id));
    setArchived((p) => p.filter((i) => i.id !== id));
    setEvents((p) => p.filter((e) => e.extendedProps.idea_id !== id));
  };

  // -----------------------------------------------------
  // UPCOMING 5 EVENTS
  // -----------------------------------------------------
  const nextFive = [...events]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5);

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div
      className="
        flex flex-col lg:flex-row 
        min-h-[calc(100vh-80px)] 
        gap-6 
        text-white 
        px-3 md:px-6
        pt-4 
        bg-[#0F0E17]
      "
    >
      {/* Sidebar – stacks above calendar on mobile */}
      <div className="w-full lg:w-auto">
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
      </div>

      {/* Calendar – full width on mobile */}
      <div className="flex-1 min-w-0">
        <CalendarView
          events={events}
          onEventDrop={handleEventDrop}
          onExternalDrop={handleExternalDrop}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Modals */}
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
