import { useState } from "react";
import { X } from "lucide-react";
import { login, register, forgotPassword, resetPassword } from "../shared/api";
import { btnPrimary, card, eyebrow } from "./ui";

export default function AuthModal({ onClose, onAuthSuccess }: { onClose: () => void; onAuthSuccess: (user: any) => void; }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleResendOtp = async () => {
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setMsg("OTP resent! Check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    
    try {
      if (mode === "login") {
        const u = await login({ email, password });
        onAuthSuccess({ id: u.userId, name: u.username });
      } else if (mode === "register") {
        const u = await register({ email, phoneNumber: phone, name, username, password });
        onAuthSuccess({ id: u.userId, name: u.username });
      } else if (mode === "forgot") {
        const res = await forgotPassword({ email });
        setMsg(res.message);
        setMode("reset");
      } else if (mode === "reset") {
        const res = await resetPassword({ email, otp, newPassword: password });
        setMsg(res.message);
        setMode("login");
        setPassword("");
        setOtp("");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-night/50 border border-fog/10 rounded-lg px-4 h-11 text-fog placeholder:text-mist focus:outline-none focus:border-amber transition-colors";

  const getTitle = () => {
    if (mode === "login") return "Login";
    if (mode === "register") return "Register";
    if (mode === "forgot") return "Forgot Password";
    return "Reset Password";
  };

  return (
    <div className="fixed inset-0 z-50 bg-abyss/80 grid place-items-center p-4 ll-fade">
      <div className={card + " relative w-full max-w-md p-6 md:p-8 text-center"}>
        <button onClick={onClose} className="absolute top-4 right-4 text-mist hover:text-fog transition-colors">
          <X size={20} />
        </button>
        <p className={eyebrow}>{mode === "login" ? "Welcome back" : mode === "register" ? "Create an account" : "Account Recovery"}</p>
        <h2 className="font-display text-fog text-4xl font-light mt-2 mb-6">
          {getTitle()}
        </h2>
        
        {error && <p className="text-amber text-sm text-center mb-4">{error}</p>}
        {msg && <p className="text-mint text-sm mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Username</label>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="johndoe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="1234567890" />
              </div>
            </>
          )}

          {mode !== "reset" && (
            <div>
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="johndoe@gmail.com" />
            </div>
          )}

          {mode === "reset" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-mist uppercase tracking-wider">OTP (sent to email)</label>
                  <button type="button" onClick={handleResendOtp} disabled={loading} className="text-xs text-amber hover:underline">Resend OTP</button>
                </div>
                <input required type="text" value={otp} onChange={e => setOtp(e.target.value)} className={inputClass} placeholder="123456" />
              </div>
            </>
          )}

          {(mode === "login" || mode === "register" || mode === "reset") && (
            <div>
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">{mode === "reset" ? "New Password" : "Password"}</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
              {mode === "login" && (
                <button type="button" onClick={() => { setMode("forgot"); setError(null); setMsg(null); }} className="text-xs text-amber mt-2 hover:underline">Forgot password?</button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className={btnPrimary + " w-full mt-4 h-12"}>
            {loading ? "Processing..." : mode === "login" ? "Enter" : mode === "register" ? "Register" : mode === "forgot" ? "Send OTP" : "Reset"}
          </button>
        </form>

        <p className="mt-6 text-sm text-mist">
          {(mode === "login" || mode === "forgot" || mode === "reset") ? "Don't have an account?" : "Already registered?"}
          <button onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(null); setMsg(null); }} className="text-amber ml-2 font-semibold hover:underline">
            {(mode === "login" || mode === "forgot" || mode === "reset") ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
