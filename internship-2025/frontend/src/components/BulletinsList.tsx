import { memo, useState, useEffect, useCallback, useRef } from "react";
import BulletinCard from "./BulletinCard";
import { type Bulletin } from "../types/bulletinsTypes";

interface BulletinsListProps {
  isLoading: boolean;
  bulletins: Array<Bulletin>;
  itemsPerPage?: number;
}

const BulletinsList = memo(({ bulletins, isLoading, itemsPerPage = 15 }: BulletinsListProps) => {
  const [visibleBulletins, setVisibleBulletins] = useState<Bulletin[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // загружаем начальную порцию объявлений
  useEffect(() => {
    if (bulletins && bulletins.length > 0) {
      const initialBulletins = bulletins.slice(0, itemsPerPage);
      setVisibleBulletins(initialBulletins);
      setCurrentPage(1);
      setIsLoadingMore(false);
    } else {
      setVisibleBulletins([]);
      setCurrentPage(1);
      setIsLoadingMore(false);
    }
  }, [bulletins, itemsPerPage]);

  // функция для загрузки следующей порции объявлений
  const loadMoreBulletins = useCallback(() => {
    if (isLoadingMore || isLoading) return;

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const nextBulletins = bulletins.slice(startIndex, endIndex);

    if (nextBulletins.length > 0) {
      setIsLoadingMore(true);
      setVisibleBulletins(prev => [...prev, ...nextBulletins]);
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }
  }, [bulletins, currentPage, itemsPerPage, isLoadingMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && visibleBulletins.length < bulletins.length) {
          loadMoreBulletins();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px"
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loadMoreBulletins, visibleBulletins.length, bulletins.length]);

  const bulletinCards = () => {
    if (!visibleBulletins || visibleBulletins.length === 0) {
      return <p className="p-3 text-center">Нет доступных объявлений</p>;
    }

    return visibleBulletins.map((bulletin: Bulletin) => (
      <BulletinCard key={bulletin["bulletin.id"]} {...bulletin} />
    ));
  };

  if (isLoading && visibleBulletins.length === 0) {
    return <div className="p-3 text-center">Загрузка объявлений...</div>;
  }

  const hasMoreBulletins = visibleBulletins.length < bulletins.length;

  return (
    <div>
      {bulletinCards()}
      
      {/* триггер */}
      {hasMoreBulletins && (
        <div ref={observerRef} className="p-4 text-center"></div>
      )}
    </div>
  );
});

BulletinsList.displayName = "BulletinsList";

export default BulletinsList;