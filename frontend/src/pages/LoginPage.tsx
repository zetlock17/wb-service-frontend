import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import usePortalStore from "../store/usePortalStore";
import { getRolesFromToken, setTokens } from "../utils/authTokens";

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
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 sm:max-w-lg">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-slate-700">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            WB
          </span>
          <div className="text-sm leading-tight">
            <div className="font-semibold text-slate-900">WB Service</div>
            <div className="text-xs text-slate-500">Корпоративный портал</div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.1)] sm:p-8">
          <form className="flex h-full flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Авторизация</h2>
            <p className="text-sm text-slate-500">Введите логин и пароль, чтобы продолжить.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700" htmlFor="login">
              Логин
              <input
                id="login"
                name="login"
                type="text"
                placeholder="petrov.av"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Пароль
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Введите пароль"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-auto space-y-4">
            <button
              type="submit"
              className="w-full rounded-2xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Входим..." : "Войти"}
            </button>
          </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;