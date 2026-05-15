import { Cake } from "lucide-react";
import type { Birthday } from "../../../types/portal";
import { birthdayLabels, birthdayOptions, type BirthdayFilter } from "../types";
import { formatBirthdayDate, isBirthdayToday } from "../utils/dateUtils";
import Card from "./Card";
import FilterSwitch from "./FilterSwitch";

interface BirthdaysCardProps {
  birthdays: Birthday[];
  filter: BirthdayFilter;
  setFilter: (value: BirthdayFilter) => void;
  onOpenProfile: (eid: number | string) => void;
  onCongratulate: (person: Birthday) => void;
}

const BirthdaysCard = ({
  birthdays,
  filter,
  setFilter,
  onOpenProfile,
  onCongratulate,
}: BirthdaysCardProps) => (
  <Card
    title="Ближайшие дни рождения"
    icon={<Cake className="w-4 h-4 text-wb-green" />}
    action={
      <FilterSwitch
        options={birthdayOptions}
        labels={birthdayLabels}
        filter={filter}
        setFilter={setFilter}
      />
    }
  >
    <div className="space-y-2">
      {birthdays.length ? (
        birthdays.map((person) => {
          const today = isBirthdayToday(person.birth_date);
          return (
            <div
              key={person.eid}
              className={`flex items-center justify-between p-3 rounded-xl ${
                today ? "bg-wb-green" : "bg-wb-pink-light"
              }`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => onOpenProfile(person.eid)}
                  className={`font-medium ${today ? "text-white" : "text-gray-900"} hover:underline`}
                >
                  {person.full_name}
                </button>
                <p className={`text-sm ${today ? "text-white/70" : "text-gray-500"}`}>{person.org_unit}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${today ? "text-white" : "text-gray-500"}`}>
                  {today ? "Сегодня" : formatBirthdayDate(person.birth_date)}
                </p>
                {today ? (
                  <button
                    onClick={() => onCongratulate(person)}
                    className="text-xs px-2.5 py-1 border border-white/60 text-white rounded-full hover:bg-wb-green-dark transition-colors"
                  >
                    Поздравить
                  </button>
                ) : (
                  <button
                    onClick={() => onCongratulate(person)}
                    className="text-xs px-2.5 py-1 bg-wb-green-dark text-white rounded-full hover:bg-wb-green transition-colors"
                  >
                    Поздравить
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Нет дней рождения в выбранном периоде</p>
      )}
    </div>
  </Card>
);

export default BirthdaysCard;
