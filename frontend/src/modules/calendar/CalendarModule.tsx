import { CalendarPlus, Clock, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { CalendarEvent } from "../../types/portal";

type RangeFilter = "all" | "week" | "month";

const parseDate = (value: string) => {
  const [day, month, year] = value.split(".").map(Number);
  return new Date(year, month - 1, day);
};

const CalendarModule = () => {
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { calendarEvents, loading } = usePortalStore();

  const filteredEvents = useMemo(() => {
    const today = new Date();
    return [...calendarEvents]
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
      .filter((event) => {
        if (rangeFilter === "all") {
          return true;
        }
        const eventDate = parseDate(event.date);
        if (rangeFilter === "week") {
          const diff = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;
        }
        return eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth();
      });
  }, [calendarEvents, rangeFilter]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-3 mb-6">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Календарь событий</h2>
            <p className="text-gray-500 text-sm mt-1">Следите за ближайшими встречами и мероприятиями</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Создать событие
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Все", value: "all" },
            { label: "На этой неделе", value: "week" },
            { label: "В этом месяце", value: "month" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRangeFilter(filter.value as RangeFilter)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                rangeFilter === filter.value
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="relative w-full text-left bg-white border border-gray-200 rounded-lg p-5 pl-16 hover:shadow-md transition-shadow"
              >
                <span className="absolute left-2 top-6 w-5 h-5 rounded-full border-2 border-purple-200 bg-white flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                </span>
                <div className="flex flex-wrap gap-4 items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">{event.location}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.participants} участников
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                </div>
              </button>
            ))}
            {!filteredEvents.length && <p className="text-center text-gray-500 py-8">События по фильтру не найдены</p>}
          </div>
        </div>
      </div>

      <Modal isOpen={Boolean(selectedEvent)} title={selectedEvent?.title ?? ""} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded-full">{selectedEvent.date}</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedEvent.time}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedEvent.location}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {selectedEvent.participants} участников
              </span>
            </div>
            <p className="text-gray-700">
              Подробности о событии будут отображены здесь. Вы узнаете повестку, список выступающих и используемые материалы. Подтвердите участие, чтобы организаторы учли вас в списке.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-44 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Подтвердить участие</button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Добавить в календарь</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarModule;
