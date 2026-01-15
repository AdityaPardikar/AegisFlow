import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/login/access-token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      
      toast.success("Welcome back to AegisFlow");
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            AegisFlow Access
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your secure credentials to verify identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@aegisflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/50 border-slate-800 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/50 border-slate-800 focus:ring-emerald-500/20"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Secure Login"}
            </Button>
            
            <div className="text-center text-xs text-slate-500 mt-4">
              Authorized Personnel Only. All actions are logged.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
