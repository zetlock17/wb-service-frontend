import { Calendar } from "lucide-react";
import type { CalendarEvent, ModuleId } from "../../../types/portal";
import Card from "./Card";

interface EventsCardProps {
  events: CalendarEvent[];
  onNavigate: (moduleId: ModuleId) => void;
}

const EventsCard = ({ events, onNavigate }: EventsCardProps) => (
  <Card title="Ближайшие события" icon={<Calendar className="w-5 h-5 text-purple-600" />}>
    <div className="space-y-3">
      {events.slice(0, 3).map((event) => (
        <div
          key={event.id}
          className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <p className="font-medium text-gray-900 mb-1">{event.title}</p>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{event.date}</span>
            <span>{event.time}</span>
          </div>
        </div>
      ))}
    </div>
    <button onClick={() => onNavigate("calendar")} className="mt-4 text-sm text-purple-600 hover:underline">
      Смотреть все события →
    </button>
  </Card>
);

export default EventsCard;
