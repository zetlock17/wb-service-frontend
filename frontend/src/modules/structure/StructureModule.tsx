import { Download, Plus, RotateCw, SlidersHorizontal, Users2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OrgUnitHierarchy, ProfileSuggestion } from "../../api/orgStructureApi";
import { exportHierarchy } from "../../api/orgStructureApi";
import usePortalStore from "../../store/usePortalStore";
import {
  CreateOrgUnitModal,
  EditOrgUnitModal,
  DeleteOrgUnitModal,
  SetManagerModal,
  MoveOrgUnitModal,
  RemoveManagerModal,
  AddEmployeeModal,
  RemoveEmployeeModal,
} from "./OrgUnitManagement";
import type { ExpandedNodes } from "./types";
import DepartmentNode from "./components/DepartmentNode";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import StructureStats from "./components/StructureStats";
import useStructureStats from "./hooks/useStructureStats";
import useSearchSuggestions from "./hooks/useSearchSuggestions";
import useSearchResults from "./hooks/useSearchResults";

const StructureModule = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { organizationHierarchy, unitEmployees, loading, fetchOrgStructure, roles, removeEmployeeFromOrgUnitAsync } = usePortalStore();
  const canManage = roles.includes("admin") || roles.includes("hr");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setManagerModalOpen, setSetManagerModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [removeManagerModalOpen, setRemoveManagerModalOpen] = useState(false);
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [removeEmployeeModalOpen, setRemoveEmployeeModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnitHierarchy | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  useEffect(() => {
    if (organizationHierarchy.length === 0) fetchOrgStructure();
  }, [organizationHierarchy.length, fetchOrgStructure]);

  const stats = useStructureStats(organizationHierarchy);
  const { suggestions, clear: clearSuggestions } = useSearchSuggestions(searchQuery);
  const { results: searchResults, error: searchError } = useSearchResults(activeSearchQuery);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setExpandedNodes({});
    clearSuggestions();
  }, [clearSuggestions]);

  const handleSearchSubmit = useCallback(() => {
    setActiveSearchQuery(searchQuery);
    clearSuggestions();
  }, [searchQuery, clearSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: ProfileSuggestion) => {
    setSearchQuery(suggestion.full_name);
    setActiveSearchQuery(suggestion.full_name);
    clearSuggestions();
  }, [clearSuggestions]);

  const handleCreateChild = useCallback((parentId: number) => {
    setSelectedParentId(parentId);
    setCreateModalOpen(true);
  }, []);

  const handleEditUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setEditModalOpen(true);
  }, []);

  const handleDeleteUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setDeleteModalOpen(true);
  }, []);

  const handleSetManager = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setSetManagerModalOpen(true);
  }, []);

  const handleMoveUnit = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setMoveModalOpen(true);
  }, []);

  const handleRemoveManager = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setRemoveManagerModalOpen(true);
  }, []);

  const handleAddEmployee = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setAddEmployeeModalOpen(true);
  }, []);

  const handleRemoveEmployee = useCallback((unit: OrgUnitHierarchy) => {
    setSelectedUnit(unit);
    setRemoveEmployeeModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => fetchOrgStructure(), [fetchOrgStructure]);

  const handleRemoveEmployeeById = useCallback(async (unitId: number, eid: string) => {
    await removeEmployeeFromOrgUnitAsync(unitId, eid);
    handleRefresh();
  }, [removeEmployeeFromOrgUnitAsync, handleRefresh]);

  const handleOpenProfile = useCallback(
    (eid: string) => navigate(`/profile/${eid}`),
    [navigate]
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-48 animate-pulse rounded-[28px] bg-wb-green/30" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[28px] bg-white" />
          ))}
        </div>
        <div className="h-20 animate-pulse rounded-[28px] bg-white" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[22px] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* hero */}
      <header className="relative overflow-hidden rounded-[28px] bg-wb-green px-7 pt-8 pb-10 sm:px-10">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-wb-pink-dark/30 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-extrabold tracking-wide text-white ring-1 ring-inset ring-white/15 backdrop-blur">
              <Users2 className="h-3.5 w-3.5" />
              Карта команды
            </span>
            <h1 className="mt-4 text-[36px] font-black leading-[1.02] tracking-tight text-white sm:text-[44px]">
              Организационная структура
            </h1>
            <p className="mt-2 max-w-[640px] text-[16px] font-medium leading-snug text-white/75">
              Навигация по подразделениям, руководителям и ролям в одном месте.
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wb-pink-dark px-5 py-3 text-[14.5px] font-bold text-white transition hover:-translate-y-px"
              >
                <Plus className="h-4 w-4" />
                Создать подразделение
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-[14.5px] font-bold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition hover:-translate-y-px hover:bg-white/15"
              >
                <RotateCw className="h-4 w-4" />
                Обновить
              </button>
            </div>
          )}
        </div>
      </header>

      {/* stats */}
      <StructureStats {...stats} />

      {/* search row */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-[28px] bg-white p-3.5">
        <SearchBar
          searchQuery={searchQuery}
          suggestions={suggestions}
          onQueryChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onSuggestionClick={handleSuggestionClick}
        />
        <button
          type="button"
          onClick={() => exportHierarchy()}
          className="inline-flex items-center gap-2 rounded-full bg-wb-pink-light px-5 py-3 text-[14px] font-bold text-wb-green transition hover:opacity-80"
        >
          <Download className="h-4 w-4" />
          Экспорт
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold transition ${
            filtersOpen
              ? "bg-wb-pink-dark text-white"
              : "bg-white text-gray-700 ring-1 ring-inset ring-gray-200 hover:ring-wb-green"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </button>
      </div>

      {filtersOpen && (
        <section className="grid grid-cols-1 gap-4 rounded-[28px] bg-white p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <div className="mb-2 text-[12.5px] font-bold tracking-wide text-gray-500">Уровень</div>
            <input className="w-full rounded-full bg-wb-pink-light px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-wb-green transition" placeholder="Любой" />
          </div>
          <div>
            <div className="mb-2 text-[12.5px] font-bold tracking-wide text-gray-500">Руководитель</div>
            <input className="w-full rounded-full bg-wb-pink-light px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-wb-green transition" placeholder="EID" />
          </div>
          <div>
            <div className="mb-2 text-[12.5px] font-bold tracking-wide text-gray-500">Статус</div>
            <input className="w-full rounded-full bg-wb-pink-light px-4 py-3 text-[14.5px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-wb-green transition" placeholder="Все" />
          </div>
        </section>
      )}

      {/* content */}
      {activeSearchQuery.trim() ? (
        <SearchResults
          results={searchResults}
          searchError={searchError}
          onOpenProfile={handleOpenProfile}
          onReset={handleReset}
        />
      ) : (
        <section className="flex flex-col gap-3">
          {organizationHierarchy.length > 0 ? (
            organizationHierarchy.map((unit) => (
              <DepartmentNode
                key={unit.id}
                unit={unit}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
                canManage={canManage}
                allUnits={organizationHierarchy}
                employeesByUnit={unitEmployees}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
                onSetManager={handleSetManager}
                onRemoveManager={handleRemoveManager}
                onAddEmployee={handleAddEmployee}
                onRemoveEmployee={handleRemoveEmployee}
                onRemoveEmployeeById={handleRemoveEmployeeById}
                onMove={handleMoveUnit}
                onCreateChild={handleCreateChild}
                onOpenProfile={handleOpenProfile}
              />
            ))
          ) : (
            <div className="rounded-[28px] bg-white p-12 text-center">
              <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-wb-pink-light text-wb-pink-dark">
                <Users2 className="h-7 w-7" />
              </div>
              <p className="text-[15px] font-semibold text-gray-500">Структура пуста</p>
            </div>
          )}
        </section>
      )}

      <CreateOrgUnitModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedParentId(null);
        }}
        parentId={selectedParentId}
        onSuccess={handleRefresh}
      />

      {selectedUnit && (
        <>
          <EditOrgUnitModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
          <DeleteOrgUnitModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
          <SetManagerModal
            isOpen={setManagerModalOpen}
            onClose={() => setSetManagerModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
          <MoveOrgUnitModal
            isOpen={moveModalOpen}
            onClose={() => setMoveModalOpen(false)}
            unit={selectedUnit}
            allUnits={organizationHierarchy}
            onSuccess={handleRefresh}
          />
          <RemoveManagerModal
            isOpen={removeManagerModalOpen}
            onClose={() => setRemoveManagerModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
          <AddEmployeeModal
            isOpen={addEmployeeModalOpen}
            onClose={() => setAddEmployeeModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
          <RemoveEmployeeModal
            isOpen={removeEmployeeModalOpen}
            onClose={() => setRemoveEmployeeModalOpen(false)}
            unit={selectedUnit}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
};

export default StructureModule;
