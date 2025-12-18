import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error?: string | null;
  onRetry?: () => void;
  onGoHome?: () => void;
}

const ErrorPage = ({ error, onRetry, onGoHome }: ErrorPageProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-purple-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Что-то пошло не так
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error || "Произошла ошибка. Пожалуйста, попробуйте позже."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Повторить
            </button>
          )}
          
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-4 h-4" />
              На главную
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
