import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface ResetPasswordApi {
  validateResetToken: (token: string) => Promise<{
    success: boolean;
    isValid: boolean;
    email?: string | null;
    error?: string;
  }>;
  resetPasswordWithToken: (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

interface ResetPasswordTokenScreenProps {
  authApi: ResetPasswordApi;
  appName: string;
  onGoToLogin: () => void;
}

export function ResetPasswordTokenScreen(props: ResetPasswordTokenScreenProps) {
  const { authApi, appName, onGoToLogin } = props;
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);

  useEffect(() => {
    const validarToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }
      const response = await authApi.validateResetToken(token);
      setIsTokenValid(response.success && response.isValid);
      setTargetEmail(response.email || null);
      if (!response.success || !response.isValid) {
        toast.error(response.error || 'Token inválido ou expirado.');
      }
      setIsValidating(false);
    };
    void validarToken();
  }, [authApi, token]);

  const validarSenha = (): string | null => {
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (password !== confirmPassword) return 'As senhas não coincidem.';
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const erroValidacao = validarSenha();
    if (erroValidacao) {
      toast.error(erroValidacao);
      return;
    }
    setIsSubmitting(true);
    const loadingId = 'reset-password-loading';
    toast.loading('Redefinindo senha...', { id: loadingId });
    const response = await authApi.resetPasswordWithToken(token, password, confirmPassword);
    toast.dismiss(loadingId);
    setIsSubmitting(false);
    if (!response.success) {
      toast.error(response.error || 'Não foi possível redefinir a senha.');
      return;
    }
    toast.success(response.message || 'Senha alterada com sucesso.');
    onGoToLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-aumigo-blue/10 via-white to-aumigo-orange/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 md:p-8 space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-aumigo-orange font-semibold">{appName}</p>
          <h1 className="text-2xl font-semibold text-aumigo-blue">Criar nova senha</h1>
          <p className="text-sm text-gray-600">
            Defina uma senha forte para proteger sua conta.
          </p>
        </div>
        {isValidating ? (
          <p className="text-sm text-gray-500">Validando token...</p>
        ) : !isTokenValid ? (
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              Este link de recuperação é inválido ou expirou.
            </p>
            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full rounded-lg bg-aumigo-blue text-white py-2.5 hover:opacity-90 transition-opacity"
            >
              Voltar para login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {targetEmail && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                <p className="text-xs text-blue-700">
                  Você está alterando a senha de: <strong>{targetEmail}</strong>
                </p>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20 focus:outline-none focus:ring-2 focus:ring-aumigo-orange"
                  placeholder="Digite sua nova senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-aumigo-blue hover:underline"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20 focus:outline-none focus:ring-2 focus:ring-aumigo-orange"
                  placeholder="Confirme sua nova senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-aumigo-blue hover:underline"
                >
                  {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-aumigo-orange text-white py-2.5 disabled:opacity-70 hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
