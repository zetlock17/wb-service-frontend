import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileByEid, updateProfileByEid } from "../../api/profileApi";
import { useAvatarWithEdit } from "../../hooks/useAvatar";
import usePortalStore from "../../store/usePortalStore";
import type {
  BirthDayType,
  Birthday,
  ModuleId,
  UserProfile,
} from "../../types/portal";
import AboutCard from "./components/AboutCard";
import AvatarModal from "./components/AvatarModal";
import BirthdaysCard from "./components/BirthdaysCard";
import CongratulateModal from "./components/CongratulateModal";
import ContactsCard from "./components/ContactsCard";
import EditProfileModal from "./components/EditProfileModal";
import EventsCard from "./components/EventsCard";
import HomeSkeleton from "./components/HomeSkeleton";
import ProfileDataCard from "./components/ProfileDataCard";
import ProfileHeader from "./components/ProfileHeader";
import ProjectsCard from "./components/ProjectsCard";
import StructureCard from "./components/StructureCard";
import TrainingCard from "./components/TrainingCard";
import VacationCard from "./components/VacationCard";
import { useExternalProfile } from "./hooks/useExternalProfile";
import { type BirthdayFilter, type EditingField } from "./types";
import { openProfileByEid, openProfileByName } from "./utils/profileNavigation";

interface HomeModuleProps {
  onNavigate: (moduleId: ModuleId) => void;
  profileEid?: string;
}

const HomeModule = ({ onNavigate, profileEid }: HomeModuleProps) => {
  const navigate = useNavigate();
  const {
    currentUser,
    upcomingBirthdays,
    calendarEvents,
    courses,
    loading,
    updateCurrentUser,
    fetchBirthdays,
    roles,
    organizationHierarchy,
    employees,
  } = usePortalStore();

  const [birthdayFilter, setBirthdayFilter] = useState<BirthdayFilter>("week");
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const {
    avatarUrl,
    isLoading: avatarLoading,
    error: avatarError,
    deleteAvatar,
    updateAvatar,
  } = useAvatarWithEdit();

  const isForeignProfile = Boolean(
    profileEid && currentUser && String(profileEid) !== String(currentUser.eid),
  );

  const {
    externalProfile,
    setExternalProfile,
    externalProfileLoading,
    externalProfileError,
    externalAvatarUrl,
  } = useExternalProfile(profileEid, isForeignProfile, Boolean(currentUser));

  const isHr = roles.includes("hr");
  const user: UserProfile | null = isForeignProfile ? externalProfile : currentUser;
  const canEditPersonalFields = isForeignProfile ? isHr : true;
  const canEditAvatar = !isForeignProfile;
  const displayedAvatarUrl = isForeignProfile ? externalAvatarUrl : avatarUrl;

  const orgUnitOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    const walk = (items: typeof organizationHierarchy) => {
      items.forEach((unit) => {
        options.push({ value: unit.id, label: unit.name });
        if (unit.children?.length) walk(unit.children);
      });
    };
    walk(organizationHierarchy || []);
    return options;
  }, [organizationHierarchy]);

  const orgUnitIdByName = useMemo(
    () => new Map(orgUnitOptions.map((unit) => [unit.label, unit.value])),
    [orgUnitOptions],
  );

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((employee) => ({
        value: String(employee.id),
        label: `${employee.full_name} — ${employee.position}`,
        name: employee.full_name,
      })),
    [employees],
  );

  const employeeIdByName = useMemo(
    () => new Map(employeeOptions.map((employee) => [employee.name, employee.value])),
    [employeeOptions],
  );

  useEffect(() => {
    const timeUnit: BirthDayType =
      birthdayFilter === "today" ? "day" : birthdayFilter === "week" ? "week" : "month";
    fetchBirthdays(timeUnit);
  }, [birthdayFilter, fetchBirthdays]);

  const filteredBirthdays = useMemo(() => {
    if (!upcomingBirthdays || !Array.isArray(upcomingBirthdays)) return [];
    return upcomingBirthdays;
  }, [upcomingBirthdays]);

  const startEditing = (section: string, field?: string, currentValue?: unknown, index?: number) => {
    setEditingField({ section: section as EditingField["section"], field, index });
    setEditingValues((currentValue as Record<string, any>) || {});
  };

  const cancelEditing = () => setEditingField(null);

  const saveEditing = async () => {
    if (!user || !editingField) return;
    const updates: Record<string, any> = {};

    if (editingField.section === "profile") {
      Object.assign(updates, editingValues);
    } else if (editingField.section === "projects") {
      const currentProjects = user.projects || [];
      if (editingField.field === "add") {
        const { id: _newId, ...projectData } = editingValues;
        void _newId;
        updates.projects = [
          ...currentProjects.map((p) => {
            const { id: _id, ...rest } = p;
            void _id;
            return rest;
          }),
          projectData,
        ];
      } else if (editingField.index !== undefined) {
        const updatedProjects = [...currentProjects];
        updatedProjects[editingField.index] = {
          ...updatedProjects[editingField.index],
          ...editingValues,
        };
        updates.projects = updatedProjects.map((p) => {
          const { id: _id, ...rest } = p;
          void _id;
          return rest;
        });
      }
    } else if (editingField.section === "vacations") {
      const currentVacations = user.vacations || [];
      if (currentVacations.length > 0) {
        const updatedVacations = [...currentVacations];
        updatedVacations[0] = { ...updatedVacations[0], ...editingValues };
        updates.vacations = updatedVacations;
      }
    }

    if (isForeignProfile && isHr) {
      const response = await updateProfileByEid(String(user.eid), updates);
      if (response.status >= 200 && response.status < 300) {
        if (response.data) setExternalProfile(response.data);
        const refreshed = await getProfileByEid(String(user.eid));
        if (refreshed.status >= 200 && refreshed.status < 300 && refreshed.data) {
          setExternalProfile(refreshed.data);
        }
      }
    } else if (currentUser) {
      await updateCurrentUser(currentUser.eid, updates);
    }

    setEditingField(null);
  };

  if (loading || externalProfileLoading || !currentUser || !user) {
    return <HomeSkeleton />;
  }

  const currentVacation = user.vacations && user.vacations.length > 0 ? user.vacations[0] : null;

  return (
    <div className="space-y-6">
      {isForeignProfile && externalProfileError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {externalProfileError}
        </div>
      )}

      <ProfileHeader
        user={user}
        displayedAvatarUrl={displayedAvatarUrl}
        canEditAvatar={canEditAvatar}
        currentVacation={currentVacation}
        onAvatarClick={() => setShowAvatarModal(true)}
        isOwnProfile={!isForeignProfile}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileDataCard
          user={user}
          isHr={isHr}
          orgUnitIdByName={orgUnitIdByName}
          employeeIdByName={employeeIdByName}
          startEditing={startEditing}
        />
        <ContactsCard
          user={user}
          canEditPersonalFields={canEditPersonalFields}
          isHr={isHr}
          startEditing={startEditing}
        />
        <StructureCard
          user={user}
          onNavigate={onNavigate}
          onOpenProfileByName={(name) => openProfileByName(navigate, name)}
        />
      </div>

      <AboutCard
        user={user}
        canEditPersonalFields={canEditPersonalFields}
        startEditing={startEditing}
      />

      <ProjectsCard
        user={user}
        canEditPersonalFields={canEditPersonalFields}
        startEditing={startEditing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {currentVacation && (
            <VacationCard
              vacation={currentVacation}
              canEditPersonalFields={canEditPersonalFields}
              startEditing={startEditing}
            />
          )}
          <EventsCard events={calendarEvents} onNavigate={onNavigate} />
        </div>

        <div className="flex flex-col gap-6">
          <BirthdaysCard
            birthdays={filteredBirthdays}
            filter={birthdayFilter}
            setFilter={setBirthdayFilter}
            onOpenProfile={(eid) => openProfileByEid(navigate, eid)}
            onCongratulate={setSelectedPerson}
          />
          <TrainingCard courses={courses} onNavigate={onNavigate} />
        </div>
      </div>

      <CongratulateModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />

      <EditProfileModal
        editingField={editingField}
        values={editingValues}
        setValues={setEditingValues}
        orgUnitOptions={orgUnitOptions}
        employeeOptions={employeeOptions}
        onSave={saveEditing}
        onCancel={cancelEditing}
      />

      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarUrl={avatarUrl}
        avatarLoading={avatarLoading}
        avatarError={avatarError}
        updateAvatar={updateAvatar}
        deleteAvatar={deleteAvatar}
      />
    </div>
  );
};

export default HomeModule;
