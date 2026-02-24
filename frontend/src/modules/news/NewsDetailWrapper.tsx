import { useParams } from "react-router-dom";
import NewsDetailPage from "./NewsDetailPage";

const NewsDetailWrapper = () => {
  const { newsId } = useParams();

  if (!newsId) {
    return null;
  }

  return <NewsDetailPage />;
};

export default NewsDetailWrapper;
