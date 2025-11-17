"use client";

import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { apiFetch } from "@/lib/api";
import ScheduleModal from "./components/ScheduleModal";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [unscheduledIdeas, setUnscheduledIdeas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [ideaToSchedule, setIdeaToSchedule] = useState(null);

  const loadCalendar = useCallback(async () => {
    const res = await apiFetch("/api/v1/calendar");
    const scheduled = res.data.scheduled;
    const unscheduled = res.data.unscheduled;

    setUnscheduledIdeas(unscheduled);

    const mapped = [];

    for (const idea of scheduled) {
      if (idea.filming_date) {
        mapped.push({
          id: `${idea.id}-film`,
          title: `🎥 ${idea.title}`,
          date: idea.filming_date,
          backgroundColor: "#F8E45C",
          borderColor: "#F8E45C",
          extendedProps: { type: "filming", idea_id: idea.id }
        });
      }

      if (idea.publish_date) {
        mapped.push({
          id: `${idea.id}-publish`,
          title: `📢 ${idea.title}`,
          date: idea.publish_date,
          backgroundColor: "#00F5A0",
          borderColor: "#00F5A0",
          extendedProps: { type: "publish", idea_id: idea.id }
        });
      }
    }

    setEvents(mapped);
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  function handleDateClick(info) {
    setSelectedDate(info.dateStr);
    setIdeaToSchedule(null);
    setModalOpen(true);
  }

  function handleEventDrop(info) {
    const ideaId = info.event.extendedProps.idea_id;
    const type = info.event.extendedProps.type;

    apiFetch("/api/v1/calendar/schedule", {
      method: "POST",
      body: JSON.stringify({
        idea_id: ideaId,
        filming_date: type === "filming" ? info.event.startStr : null,
        publish_date: type === "publish" ? info.event.startStr : null
      })
    }).then(loadCalendar);
  }

  function handleKanbanDrop(ideaId, date) {
    setIdeaToSchedule(ideaId);
    setSelectedDate(date);
    setModalOpen(true);
  }

  return (
    <div className="flex gap-6">
      {/* SIDEBAR UNSCHEDULED LIST */}
      <div className="w-64 bg-[#13121C] border border-[#2A2935] rounded-xl p-4">
        <h3 className="font-semibold mb-3">Unscheduled Ideas</h3>

        <div className="space-y-2">
          {unscheduledIdeas.map((i) => (
            <div
              key={i.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("idea_id", String(i.id));
              }}
              className="
                p-2 rounded-lg bg-[#1B1A24] border border-[#2E2D39] 
                text-sm cursor-grab hover:bg-[#22212E]
              "
            >
              {i.title}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CALENDAR */}
      <div className="flex-1 bg-[#13121C] border border-[#2A2935] rounded-xl p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          editable={true}
          droppable={true}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          drop={(info) => {
            const ideaId = info.draggedEl.getAttribute("data-idea-id");
            const date = info.dateStr;
            handleKanbanDrop(ideaId, date);
          }}
        />
      </div>

      {modalOpen && (
        <ScheduleModal
          close={() => setModalOpen(false)}
          date={selectedDate}
          ideaId={ideaToSchedule}
          reload={loadCalendar}
        />
      )}
    </div>
  );
}
