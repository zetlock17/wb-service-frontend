import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import usePortalStore from "../store/usePortalStore";
import { getRolesFromToken, setTokens } from "../utils/authTokens";
import MainLogo from "../assets/main-logo.png";

function LoginPage() {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setRoles = usePortalStore((state) => state.setRoles);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const response = await login(loginValue.trim(), passwordValue);

    if (response.status >= 200 && response.status < 300) {
      setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        accessMaxAgeSec: response.data.expires_in,
        refreshMaxAgeSec: response.data.refresh_expires_in,
      });
      const roles = getRolesFromToken(response.data.access_token);
      setRoles(roles);
      navigate("/home", { replace: true });
      return;
    }

    setErrorMessage(response.message || "Не удалось войти. Проверьте данные.");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-wb-green flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-4">
          <img src={MainLogo} className="h-20 w-20 rounded-3xl shadow-lg" alt="WB Банк" />
          <div className="text-center">
            <div className="text-white text-xl font-bold tracking-wide">WB Банк</div>
            <div className="text-white/60 text-sm mt-0.5">Корпоративный портал</div>
          </div>
        </div>

        <section className="bg-white rounded-4xl p-8 shadow-2xl">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Вход в систему</h2>
              <p className="text-sm text-gray-400 mt-0.5">Введите ваши учётные данные</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="login">
                  Логин
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="petrov.av"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-wb-green focus:bg-white focus:ring-2 focus:ring-wb-green/10"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="password">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-wb-green focus:bg-white focus:ring-2 focus:ring-wb-green/10"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-wb-green px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Входим..." : "Войти"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
