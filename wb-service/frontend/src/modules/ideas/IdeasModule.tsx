import { ArrowUp, Lightbulb, MessageCircle, Plus, Send, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import usePortalStore from "../../store/usePortalStore";
import type { Idea } from "../../types/portal";

const statusStyles: Record<Idea["status"], string> = {
  "Реализована": "bg-green-100 text-green-700",
  "В работе": "bg-blue-100 text-blue-700",
  "Принята": "bg-purple-100 text-purple-700",
  "На рассмотрении": "bg-gray-100 text-gray-700",
};

const IdeasModule = () => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { ideas, loading, fetchPortalData } = usePortalStore();

  useEffect(() => {
    if (ideas.length === 0) {
      fetchPortalData();
    }
  }, [ideas.length, fetchPortalData]);


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Банк идей</h2>
            <p className="text-gray-500 text-sm mt-1">Предлагайте инициативы и голосуйте за предложения коллег</p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Новая идея
          </button>
        </div>
        <div className="space-y-4">
          {loading && <p>Загрузка идей...</p>}
          {ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className="w-full text-left border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Инициатива
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[idea.status]}`}>{idea.status}</span>
                <span className="text-xs text-gray-500">{idea.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{idea.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" /> {idea.votes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {idea.comments}
                </span>
                <span className="text-gray-500">Автор: {idea.author}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(selectedIdea)} title={selectedIdea?.title ?? ""} onClose={() => setSelectedIdea(null)}>
        {selectedIdea && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full ${statusStyles[selectedIdea.status]}`}>{selectedIdea.status}</span>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">Автор: {selectedIdea.author}</span>
              <span className="text-gray-500">Предложена: {selectedIdea.date}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedIdea.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                {selectedIdea.votes} голосов
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {selectedIdea.comments} комментариев
              </span>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Поддержите инициативу</p>
              <div className="flex flex-wrap gap-3">
                <button className="flex-1 min-w-40 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Голосовать
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Поделиться</button>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">Оставить комментарий</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Напишите предложение..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Отправить
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showSubmitModal} title="Новая идея" onClose={() => setShowSubmitModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Опишите идею одним предложением"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Поделитесь деталями и ожидаемым эффектом"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex-1 min-w-44 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Отправить</button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setShowSubmitModal(false)}>
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IdeasModule;
