/**
 * EXAMPLE: Document Detail Page Wrapper
 * 
 * Это пример как можно структурировать обертки для других модулей.
 * Скопируйте эту структуру для своих детальных страниц.
 */

import { useParams } from "react-router-dom";

// Импортируйте ваш основной компонент деталей
// import DocumentDetailPage from "./DocumentDetailPage";

/**
 * Обертка для детальной страницы документа
 * 
 * Роль этой обертки:
 * 1. Извлекает параметры из URL (/documents/:documentId)
 * 2. Валидирует параметры
 * 3. Пробрасывает их в основной компонент
 * 
 * DetailPageWrapper заботится о:
 * - Хэддере и навигации
 * - Поиске и уведомлениях
 * - Профиле и мобильном меню
 * - Общей статистике ошибок
 */
const DocumentDetailWrapperExample = () => {
  const { documentId } = useParams();

  // Валидация параметра
  if (!documentId) {
    return null;
  }

  // TODO: Раскомментируйте когда создадите DocumentDetailPage
  // return <DocumentDetailPage />;

  return <div>Document Detail Page - Документ #{documentId}</div>;
};

export default DocumentDetailWrapperExample;

/**
 * Как использовать в App.tsx:
 * 
 * 1. Импортируйте:
 *    import DocumentDetailWrapperExample from "./modules/documents/DocumentDetailWrapperExample";
 *    import DetailPageWrapper from "./components/layout/DetailPageWrapper";
 * 
 * 2. Добавьте маршрут в Routes:
 *    <Route
 *      path="/documents/:documentId"
 *      element={
 *        <DetailPageWrapper
 *          isAuthenticated={isAuthenticated}
 *          detailComponent={<DocumentDetailWrapperExample />}
 *          moduleFallback="documents"
 *        />
 *      }
 *    />
 * 
 * 3. Вуаля! Вся навигация и хэддер работают автоматически 🎉
 */
