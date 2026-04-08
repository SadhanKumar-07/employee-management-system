import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Please enter a username'); return; }
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-primary-foreground/20"
              style={{ width: `${200 + i * 100}px`, height: `${200 + i * 100}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <DollarSign className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">Employee Manager</h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Enterprise-grade payroll management. Streamline HR operations with automated salary processing.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Employee Manager</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-3">Demo Accounts (any password)</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">HR Manager</span>
                <code className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">hr_manager</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">General Manager</span>
                <code className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">gm_user</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Project Manager</span>
                <code className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">pm_user</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Employee</span>
                <code className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">emp_user</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
