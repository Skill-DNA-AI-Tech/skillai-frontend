import { Eye, EyeOff, KeyRound, LockKeyhole, LogIn, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { roleHome, normalizeRole } from '../lib/rbac';

const Auth = () => {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'change_temp_password' | 'admin_otp'>(new URLSearchParams(location.search).get('mode') === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempRefreshToken, setTempRefreshToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { user, role: authRole, login } = useAuth();
  const navigate = useNavigate();

  const navigateToRole = (userRole: string) => navigate(roleHome(userRole));

  // If already logged in, seamlessly redirect to appropriate portal
  useEffect(() => {
    if (user && authRole) {
      navigateToRole(authRole);
    }
  }, [user, authRole]);

  const handleSocialSuccess = async (socialUser: any) => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const path = socialUser.provider === 'google' ? '/auth/google' : '/auth/microsoft';
      const payload: Record<string, any> = {
        email: socialUser.email,
        name: socialUser.name,
        avatarUrl: socialUser.avatarUrl,
        role,
      };

      if (socialUser.provider === 'google') {
        payload.googleId = socialUser.id;
      } else {
        payload.microsoftId = socialUser.id;
      }

      const response = await apiRequest<any>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const token = response.token || response.access_token;
      const refreshToken = response.refreshToken || response.refresh_token;

      if (!token) {
        throw new Error(response.message || response.detail || 'Authentication failed.');
      }

      const userObj = response.user || response;
      login(
        { 
          _id: userObj._id || userObj.id || 'social-user', 
          name: userObj.name || socialUser.name, 
          email: userObj.email || socialUser.email, 
          role: userObj.role || role, 
          status: userObj.status || 'ACTIVE', 
          avatarUrl: userObj.avatarUrl || socialUser.avatarUrl 
        }, 
        token, 
        refreshToken
      );
      navigateToRole(userObj.role || role);
    } catch (err: any) {
      setError(err?.message || 'Unable to authenticate with social provider.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'admin_otp') {
        const verifyRes = await apiRequest<any>('/auth/admin/verify', {
          method: 'POST',
          body: JSON.stringify({ email: (adminEmail || email).trim().toLowerCase(), otp: otp.trim() }),
        });

        const token = verifyRes.access_token || verifyRes.token;
        const adminData = verifyRes.admin || verifyRes.user || {};
        const adminRole = normalizeRole(adminData.role || 'ADMIN', adminData.email || email);

        login(
          {
            _id: adminData.id || adminData._id || 'admin-id',
            name: adminData.name || adminData.email?.split('@')[0] || 'Administrator',
            email: adminData.email || (adminEmail || email).trim(),
            role: adminRole,
            status: 'ACTIVE',
            avatarUrl: adminData.avatarUrl,
          },
          token
        );

        navigateToRole(adminRole);
        return;
      }

      if (mode === 'change_temp_password') {
        const response = await apiRequest<any>('/auth/change-temp-password', {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
          token: tempToken!,
        });

        setMessage(response.message || 'Password updated successfully. Please sign in with your new password.');
        login(
          { 
            _id: response._id, 
            name: response.name, 
            email: response.email, 
            role: response.role, 
            avatarUrl: response.avatarUrl 
          }, 
          tempToken!, 
          response.refreshToken ?? tempRefreshToken ?? undefined
        );
        
        navigateToRole(response.role);
        return;
      }

      if (mode === 'login') {
        let backendRes: any = null;
        try {
          backendRes = await apiRequest<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim(), password }),
          });
        } catch (loginErr: any) {
          const errMsg = loginErr?.message || '';
          // If backend identifies this as an administrator account requiring admin login
          if (errMsg.includes('administrator') || errMsg.includes('Admin Portal')) {
            try {
              const adminRes = await apiRequest<any>('/auth/admin/login', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim(), password }),
              });

              if (adminRes.requires_otp) {
                setAdminEmail(adminRes.email || email.trim());
                setMode('admin_otp');
                setOtp('');
                setMessage(adminRes.message || 'Security verification code sent to your email. Enter the 6-digit OTP below.');
                setLoading(false);
                return;
              }
            } catch (adminErr: any) {
              throw new Error(adminErr?.message || errMsg);
            }
          }
          throw loginErr;
        }

        if (backendRes.requiresPasswordChange) {
          setTempToken(backendRes.token || backendRes.access_token);
          setTempRefreshToken(backendRes.refreshToken ?? backendRes.refresh_token ?? null);
          setMode('change_temp_password');
          setNewPassword('');
          setMessage('Temporary password detected. Please choose a new secure password.');
          return;
        }

        const userObj = backendRes.user || backendRes;
        const token = backendRes.token || backendRes.access_token;
        const refreshToken = backendRes.refreshToken || backendRes.refresh_token;
        const resolvedRole = normalizeRole(userObj.role, userObj.email || email.trim());

        login(
          {
            _id: userObj.id || userObj._id || 'user-id',
            name: userObj.name || email,
            email: userObj.email || email,
            role: resolvedRole,
            status: userObj.status || 'ACTIVE',
            avatarUrl: userObj.avatarUrl,
          },
          token,
          refreshToken
        );
        navigateToRole(resolvedRole);
        return;
      } else if (mode === 'register') {
        const response = await apiRequest<any>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role }),
        });

        const token = response.token || response.access_token;
        const refreshToken = response.refreshToken || response.refresh_token;

        if (!token) {
          setMessage(response.message || response.detail || 'Registration successful. Please sign in.');
          setMode('login');
          setPassword('');
          return;
        }

        const userObj = response.user || response;
        const resolvedRole = normalizeRole(userObj.role || role, userObj.email || email.trim());
        login(
          {
            _id: userObj.id || userObj._id || 'user-id',
            name: userObj.name || name,
            email: userObj.email || email,
            role: resolvedRole,
            status: userObj.status || 'ACTIVE',
            avatarUrl: userObj.avatarUrl,
          },
          token,
          refreshToken
        );
        navigateToRole(resolvedRole);
      } else if (mode === 'forgot') {
        const res = await apiRequest<any>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() }),
        });
        setMessage(res.message || 'OTP sent to your email. Enter it below to reset your password.');
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await apiRequest<any>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
        });
        setMessage(res.message || 'Password reset successful. Please sign in with your new password.');
        setMode('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const isCredentialMode = mode === 'login' || mode === 'register';
  const inputClass = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100';
  const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="hidden rounded-3xl bg-slate-900 p-9 text-white shadow-xl lg:block">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600"><Sparkles className="h-5 w-5" /></span><div><p className="font-bold">SkillDNA Tech AI</p><p className="text-xs text-slate-400">Your skills have a story.</p></div></div>
          <p className="mt-16 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">One common account gateway</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Understand your skills. Build your next step.</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">Students create an account here. Existing staff and administrators use the same sign-in form; the backend securely determines the account role.</p>
          <div className="mt-10 space-y-3 text-sm text-slate-300"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-blue-300" /> Role-based access comes from the backend.</div><div className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-blue-300" /> Your credentials are sent only to the existing auth API.</div><div className="flex items-center gap-3"><BookOpenCheckIcon /> Start with a profile, then follow your own path.</div></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
          <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">SkillDNA Tech AI</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{mode === 'register' ? 'Create your student account' : mode === 'login' ? 'Welcome back' : mode === 'forgot' ? 'Recover your account' : mode === 'admin_otp' ? 'Confirm administrator access' : 'Update your password'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'register' ? 'Registration is currently available for students. You can choose your career direction after signing in.' : mode === 'login' ? 'Use the same sign-in form for student and staff accounts.' : 'Complete the secure step below to continue.'}</p></div>

          {(mode === 'login' || mode === 'register') && <div className="mb-7 flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); }} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Sign in</button><button type="button" onClick={() => { setMode('register'); setError(null); setMessage(null); setRole('student'); }} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Register</button></div>}

          <form className="grid gap-5" onSubmit={handleSubmit}>
            {mode === 'register' && <label className={labelClass}><span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-blue-700" /> Full name</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your full name" autoComplete="name" required /></label>}
            {mode !== 'change_temp_password' && mode !== 'admin_otp' && <label className={labelClass}><span className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-700" /> Email address</span><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} type="email" placeholder="you@example.com" autoComplete="email" required /></label>}
            {isCredentialMode && <label className={labelClass}><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-blue-700" /> Password</span><span className="relative"><input value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-12`} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-blue-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>}
            {mode === 'admin_otp' && <><div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Enter the security code sent to <strong>{adminEmail || email}</strong>.</div><label className={labelClass}>6-digit security code<input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`${inputClass} text-center tracking-[0.4em]`} inputMode="numeric" maxLength={6} required autoFocus /></label></>}
            {mode === 'reset' && <><label className={labelClass}>OTP code<input value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} required /></label><label className={labelClass}>New password<span className="relative"><input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClass} pr-12`} type={showNewPassword ? 'text' : 'password'} required /><button type="button" aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label></>}
            {mode === 'forgot' && <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">We will use the existing password-recovery flow for this email address.</p>}
            {mode === 'change_temp_password' && <label className={labelClass}>New secure password<span className="relative"><input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClass} pr-12`} type={showNewPassword ? 'text' : 'password'} required /><button type="button" aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>}
            {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
            <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><LogIn className="h-4 w-4" />{loading ? 'Please wait…' : mode === 'register' ? 'Create student account' : mode === 'admin_otp' ? 'Verify and sign in' : mode === 'forgot' ? 'Send recovery code' : mode === 'reset' ? 'Reset password' : mode === 'change_temp_password' ? 'Update password' : 'Sign in'}</button>
            {mode === 'login' && <button type="button" onClick={() => { setMode('forgot'); setError(null); setMessage(null); }} className="text-sm font-semibold text-blue-700 hover:text-blue-900">Forgot password?</button>}
            {(mode === 'forgot' || mode === 'reset' || mode === 'admin_otp') && <button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); setOtp(''); }} className="text-left text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to sign in</button>}
          </form>
        </section>
      </div>
    </main>
  );
}

const BookOpenCheckIcon = () => <span className="grid h-5 w-5 place-items-center rounded border border-blue-300 text-[10px] font-bold text-blue-300">✓</span>;

export default Auth;
