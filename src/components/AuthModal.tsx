import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  AlertCircle,
  Check,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { College, YearOfStudy } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { COMMON_BRANCHES, YEARS } from '../constants';
import { CollegeAutocomplete } from './CollegeAutocomplete';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { signup, login, switchProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [colleges, setColleges] = useState<College[]>([]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<YearOfStudy>('2nd Year');
  const [branch, setBranch] = useState(COMMON_BRANCHES[0]);
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      db.getColleges().then((list) => {
        setColleges(list);
      });
      setErrorMsg('');
      setNotice('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setErrorMsg('Email address is required.');
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. alex@college.edu).');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    const calculatedName =
      fullName.trim() ||
      email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
        .join(' ')
        .trim() ||
      'Student Builder';

    const collegeName = selectedCollege.trim() || 'University';

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await signup(
        {
          email: email.trim(),
          full_name: calculatedName,
          college_name: collegeName,
          year_of_study: yearOfStudy,
          branch,
          bio: bio.trim(),
          skills: skills.length > 0 ? skills : ['React', 'TypeScript', 'Node.js'],
          interests: ['Collaboration', 'Hackathons', 'Project Building'],
          github_url: githubUrl.trim(),
          is_open_to_teams: true,
          role: 'student',
        },
        password
      );

      setNotice('Welcome to TeamSync! Your profile is ready.');

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Signup notice:', err.message || err);
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setErrorMsg('Please enter your email.');
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. alex@college.edu).');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const success = await login(email.trim(), password);
      if (success) {
        setNotice('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMsg('Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (profileId: string) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await switchProfile(profileId);
      setNotice('Signed in with demo profile!');
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-white">
      <div className="bg-zinc-950 rounded-2xl max-w-lg w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden bg-zinc-900 border border-white/20 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="TeamSync Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              {mode === 'signup' ? 'Create Builder Profile' : 'Sign In to TeamSync'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'signup'
                ? 'Join fellow student builders to discover teammates and projects'
                : 'Enter your credentials to access your builder account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE TABS */}
        <div className="flex border-b border-white/10 px-6 pt-3 bg-zinc-900/30">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-[#22e873] text-[#22e873]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'border-[#22e873] text-[#22e873]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Create New Profile
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl flex flex-col gap-2.5 text-rose-300 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
            </div>
          )}

          {notice && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-[#22e873] text-xs font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {mode === 'login' ? (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Your Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      Password
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full text-xs rounded-full font-bold flex items-center justify-center gap-2 mt-2 h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Logging In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-black" />
                      <span>Log In to Account</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-zinc-400">
                  Don't have a profile yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-[#22e873] hover:underline font-semibold"
                  >
                    Register new profile
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Student Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="jordan@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    Password <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">Min 6 characters</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* COLLEGE AUTOCOMPLETE */}
              <div>
                <label
                  htmlFor="signup-college-input"
                  className="block text-xs font-semibold text-zinc-300 mb-1"
                >
                  College / University <span className="text-rose-500">*</span>
                </label>
                <CollegeAutocomplete
                  id="signup-college-input"
                  required
                  value={selectedCollege}
                  onChange={setSelectedCollege}
                  colleges={colleges}
                />
              </div>

              {/* YEAR & BRANCH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value as YearOfStudy)}
                    className="w-full text-xs rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#22e873]"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-zinc-900">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Branch / Major <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full text-xs rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#22e873]"
                  >
                    {COMMON_BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-zinc-900">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Skills (comma separated)
                </label>
                <Input
                  type="text"
                  placeholder="React, Python, Figma, Cloud Computing..."
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="What are you interested in building or collaborating on?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs rounded-xl bg-zinc-950 border border-white/10 px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full text-xs rounded-full font-bold flex items-center justify-center gap-1.5 h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-black" />
                      <span>Complete Profile & Start Building</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-1">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#22e873] hover:underline font-semibold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 1-CLICK INSTANT DEMO ACCOUNTS */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-[#22e873]" /> 1-Click Instant Demo Login:
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">No password required</span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('prof-admin')}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-amber-500/60 hover:bg-zinc-800/80 transition-all text-left group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">
                    👑 Sandeep (Admin)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Admin</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate mt-1">Admin Portal Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('prof-alex')}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-[#22e873]/60 hover:bg-zinc-800/80 transition-all text-left group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white group-hover:text-[#22e873]">
                    💻 Alex Rivera
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22e873]/20 text-[#22e873] font-mono">Student</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate mt-1">Full-Stack • Stanford</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('prof-priya')}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-[#22e873]/60 hover:bg-zinc-800/80 transition-all text-left group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white group-hover:text-[#22e873]">
                    🤖 Priya Sharma
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22e873]/20 text-[#22e873] font-mono">Student</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate mt-1">AI/ML • UC Berkeley</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('prof-marcus')}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-[#22e873]/60 hover:bg-zinc-800/80 transition-all text-left group flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white group-hover:text-[#22e873]">
                    🎨 Marcus Chen
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22e873]/20 text-[#22e873] font-mono">Student</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate mt-1">UI/UX • MIT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
