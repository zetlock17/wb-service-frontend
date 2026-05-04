import { Download, Plus, Sparkles, RotateCw, SlidersVertical } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OrgUnitHierarchy, ProfileSuggestion } from "../../api/orgStructureApi";
import usePortalStore from "../../store/usePortalStore";
import {
  CreateOrgUnitModal,
  EditOrgUnitModal,
  DeleteOrgUnitModal,
  SetManagerModal,
  MoveOrgUnitModal,
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

  const { organizationHierarchy, loading, fetchOrgStructure, roles } = usePortalStore();
  const canManage = roles.includes("admin") || roles.includes("hr");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setManagerModalOpen, setSetManagerModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
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

  const handleRefresh = useCallback(() => fetchOrgStructure(), [fetchOrgStructure]);

  const handleOpenProfile = useCallback(
    (eid: string) => navigate(`/profile/${eid}`),
    [navigate]
  );

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/60 to-blue-50/40 p-6 md:p-8">
        <div className="mb-6 h-10 w-72 rounded-xl bg-purple-100" />
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-purple-100 bg-linear-to-br from-white via-purple-50/60 to-blue-50/40 shadow-sm">
        <div className="border-b border-purple-100/80 bg-white/70 p-6 backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-medium text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                Карта команды
              </div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Организационная структура</h2>
              <p className="mt-2 text-sm text-gray-600">
                Навигация по подразделениям, руководителям и ролям в одном месте.
              </p>
            </div>
            {canManage && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Создать подразделение
                </button>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <RotateCw className="h-4 w-4" />
                  Обновить
                </button>
              </div>
            )}
          </div>

          <StructureStats {...stats} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBar
              searchQuery={searchQuery}
              suggestions={suggestions}
              onQueryChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onSuggestionClick={handleSuggestionClick}
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <Download strokeWidth={2} className="h-5 w-5 text-gray-500" />
              Экспорт
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <SlidersVertical strokeWidth={2} className="h-5 w-5 text-gray-500" />
              Фильтры
            </button>
          </div>
        </div>
      </div>

      {activeSearchQuery.trim() ? (
        <SearchResults
          results={searchResults}
          searchError={searchError}
          onOpenProfile={handleOpenProfile}
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4">
          {organizationHierarchy.length > 0 ? (
            organizationHierarchy.map((unit) => (
              <div key={unit.id} className="rounded-2xl border border-purple-100 bg-white p-5 md:p-6">
                <DepartmentNode
                  unit={unit}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                  canManage={canManage}
                  allUnits={organizationHierarchy}
                  onEdit={handleEditUnit}
                  onDelete={handleDeleteUnit}
                  onSetManager={handleSetManager}
                  onMove={handleMoveUnit}
                  onCreateChild={handleCreateChild}
                  onOpenProfile={handleOpenProfile}
                />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="text-center py-12 text-gray-500">
                <p>Структура пуста</p>
              </div>
            </div>
          )}
        </div>
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
        </>
      )}
    </div>
  );
};

export default StructureModule;
