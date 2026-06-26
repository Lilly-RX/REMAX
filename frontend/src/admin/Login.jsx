import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Přihlášení úspěšné");
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Přihlášení se nezdařilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-display text-2xl font-bold text-center text-[#0A0A0A]">Administrace</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Přihlaste se pro správu webu</p>
        <form onSubmit={submit} className="mt-8 space-y-4" data-testid="login-form">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">E-mail</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" className="mt-1.5 w-full border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:border-[#003DA5]" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Heslo</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" className="mt-1.5 w-full border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:border-[#003DA5]" />
          </div>
          <button type="submit" disabled={loading} data-testid="login-submit" className="w-full bg-[#003DA5] hover:bg-[#002b75] disabled:opacity-60 text-white font-bold py-3 uppercase tracking-wider transition-colors">
            {loading ? "Přihlašování…" : "Přihlásit se"}
          </button>
        </form>
      </div>
    </div>
  );
}
