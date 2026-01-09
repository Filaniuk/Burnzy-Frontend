"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { BrandEvent, EventClickArg, EventDropArg, ExternalDropArg } from "@/types/calendar";

interface CalendarViewProps {
  events: BrandEvent[];
  onEventDrop: (arg: EventDropArg) => void;
  onExternalDrop: (arg: ExternalDropArg) => void;
  onEventClick: (arg: EventClickArg) => void;
}

export default function CalendarView({
  events,
  onEventDrop,
  onExternalDrop,
  onEventClick,
}: CalendarViewProps) {
  return (
    <div className="flex-1 rounded-xl border border-[#1A1923] bg-[#13121C] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Production Calender
        </h2>
        <span className="text-xs text-neutral-500">
          Drag ideas from the left into the calendar
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#2A2835]">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          editable={true}
          droppable={true}
          eventDrop={onEventDrop}
          drop={onExternalDrop}
          eventClick={onEventClick}
          eventClassNames={() => ["brand-calendar-event"]}
        />
      </div>
    </div>
  );
}
