import { useState } from "react";
import { X } from "lucide-react";
import { login, register } from "../shared/api";
import { btnPrimary, card, eyebrow } from "./ui";

export default function AuthModal({ onClose, onAuthSuccess }: { onClose: () => void; onAuthSuccess: (user: any) => void; }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === "login") {
        const u = await login({ email, password });
        onAuthSuccess({ id: u.userId, name: u.username });
      } else {
        const u = await register({ email, phoneNumber: phone, name, username, password });
        onAuthSuccess({ id: u.userId, name: u.username });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-night/50 border border-fog/10 rounded-lg px-4 h-11 text-fog placeholder:text-mist focus:outline-none focus:border-amber transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-abyss/80 grid place-items-center p-4 ll-fade">
      <div className={card + " relative w-full max-w-md p-6 md:p-8 text-center"}>
        <button onClick={onClose} className="absolute top-4 right-4 text-mist hover:text-fog transition-colors">
          <X size={20} />
        </button>
        <p className={eyebrow}>{mode === "login" ? "Welcome back" : "Join the dreamers"}</p>
        <h2 className="font-display text-fog text-4xl font-light mt-2 mb-6">
          {mode === "login" ? "Login" : "Register"}
        </h2>
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Cobb" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Username</label>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="dream_architect" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1 234 567 8900" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="cobb@mindsweepers.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1.5">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className={btnPrimary + " w-full mt-4 h-12"}>
            {loading ? "Processing..." : mode === "login" ? "Enter" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-mist">
          {mode === "login" ? "Don't have an account?" : "Already registered?"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }} className="text-amber ml-2 font-semibold hover:underline">
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
