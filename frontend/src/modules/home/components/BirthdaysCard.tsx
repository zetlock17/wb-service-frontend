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
    icon={<Cake className="w-5 h-5 text-purple-600" />}
    action={
      <FilterSwitch
        options={birthdayOptions}
        labels={birthdayLabels}
        filter={filter}
        setFilter={setFilter}
      />
    }
  >
    <div className="space-y-3">
      {birthdays.length ? (
        birthdays.map((person) => {
          const today = isBirthdayToday(person.birth_date);
          return (
            <div
              key={person.eid}
              className={`flex items-center justify-between p-3 rounded-lg ${today ? "bg-purple-500" : "bg-purple-50"}`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => onOpenProfile(person.eid)}
                  className={`font-medium ${today ? "text-white" : "text-gray-900"} hover:underline`}
                >
                  {person.full_name}
                </button>
                <p className={`text-sm ${today ? "text-white" : "text-gray-600"}`}>{person.org_unit}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${today ? "text-white" : "text-purple-600"}`}>
                  {formatBirthdayDate(person.birth_date)}
                </p>
                <button
                  onClick={() => onCongratulate(person)}
                  className={`text-xs ${today ? "text-white" : "text-purple-600"} hover:underline mt-1`}
                >
                  Поздравить
                </button>
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
