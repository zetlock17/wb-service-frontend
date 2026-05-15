import { Calendar } from "lucide-react";
import type { CalendarEvent, ModuleId } from "../../../types/portal";
import Card from "./Card";

interface EventsCardProps {
  events: CalendarEvent[];
  onNavigate: (moduleId: ModuleId) => void;
}

const EventsCard = ({ events, onNavigate }: EventsCardProps) => (
  <Card title="Ближайшие события" icon={<Calendar className="w-4 h-4 text-wb-green" />}>
    <div className="space-y-2">
      {events.slice(0, 3).map((event) => (
        <div
          key={event.id}
          className="flex items-stretch gap-3 p-3 bg-wb-pink-light rounded-xl hover:bg-pink-100 transition-colors"
        >
          <div className="w-1 rounded-full bg-wb-green shrink-0" />
          <div>
            <p className="font-medium text-gray-900 text-sm mb-0.5">{event.title}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{event.date}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>{event.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <button
      onClick={() => onNavigate("calendar")}
      className="mt-4 text-sm text-wb-green hover:text-wb-green-dark flex items-center gap-1 transition-colors"
    >
      Смотреть все события →
    </button>
  </Card>
);

export default EventsCard;
