// types/calendar.ts

export type IdeaStatus =
  | "unassigned"
  | "to_film"
  | "to_publish"
  | "published"
  | "archived";

export interface CalendarIdea {
  id: number;
  uuid: string;
  title: string;
  status: IdeaStatus;
  scheduled_for: string | null;
}

export interface BrandEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    idea_id: number;
    status: IdeaStatus;
  };
}

// If you want strict typing, you can import these types from FullCalendar.
// For now, keep them as any to avoid import noise.
export type EventDropArg = any;
export type ExternalDropArg = any;
export type EventClickArg = any;

// Status → Colors
export function getEventColors(status: IdeaStatus) {
  switch (status) {
    case "to_film":
      return {
        backgroundColor: "#534dcaff", // purple
        borderColor: "#6C63FF",
        textColor: "#FFFFFF",
      };
    case "to_publish":
      return {
        backgroundColor: "#00ad71ff", // green
        borderColor: "#00F5A0",
        textColor: "#ffffffff",
      };
    case "published":
      return {
        backgroundColor: "#889112ff", // soft white
        borderColor: "#d0dd13ff",
        textColor: "#FFFFFF",
      };
    case "archived":
      return {
        backgroundColor: "#504f4fff", // muted gray
        borderColor: "#636161ff",
        textColor: "#CCCCCC",
      };
    case "unassigned":
    default:
      return {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.3)",
        textColor: "#FFFFFF",
      };
  }
}
