import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RiAccountBoxFill,
  RiMenu3Fill,
} from "react-icons/ri";
import { GoCodescan } from "react-icons/go";
import { FaCodeBranch } from "react-icons/fa6";
import { TbUserSearch } from "react-icons/tb";
import { IoLogoGithub, IoMdLogOut } from 'react-icons/io';
import { MdDashboard, MdEmail } from 'react-icons/md';
import { Shield, Plus, User, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationPopover } from './NotificationPopover';
import { Button } from './ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from './ui/sheet';
import { Separator } from './ui/separator';

interface NavbarProps {
  currentTab?: string;
  onNavigate?: (tab: string, extraId?: string) => void;
  onOpenCreateTeam: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenCreateTeam,
  onOpenAuth,
}) => {
  const { currentProfile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const pathname = location.pathname;

  const navItems = [
    {
      name: "Explore Opportunities",
      path: "/opportunities",
      icon: <GoCodescan className="h-4 w-4" />,
    },
    {
      name: "Discover Builders",
      path: "/discover",
      icon: <TbUserSearch className="h-4 w-4" />,
    },
    {
      name: "My Teams",
      path: "/my-teams",
      icon: <FaCodeBranch className="h-4 w-4" />,
    },
  ];

  if (currentProfile?.role === 'admin') {
    navItems.push({
      name: "Admin Portal",
      path: "/admin",
      icon: <Shield className="h-4 w-4 text-[#22e873]" />,
    });
  }

  const handleLogout = async () => {
    setAvatarMenuOpen(false);
    await logout();
  };

  return (
    <header className="w-full relative z-40">
      <div className="fixed w-full z-40 top-0 start-0 border-b border-white/10 bg-black/75 backdrop-blur-xl transition-all">
        <div className="max-w-7xl flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 h-16">
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/20 flex items-center justify-center p-1 group-hover:border-[#22e873]/70 transition-all shadow-[0_0_15px_rgba(34,232,115,0.2)] overflow-hidden">
              <img
                src="/logo.png"
                alt="TeamSync"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="self-center text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TeamSync
              </span>
              <span className="text-[10px] font-semibold text-[#22e873] uppercase tracking-wider hidden sm:block">
                Connect • Collaborate • Build
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="items-center justify-between hidden md:flex" id="navbar-sticky">
            <ul className="flex items-center space-x-6 text-xs font-semibold">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`transition-colors py-1 px-3 rounded-full flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white/10 text-[#22e873] border border-[#22e873]/30 font-bold shadow-[0_0_10px_rgba(34,232,115,0.15)]"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT ACTION CONTROLS */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateTeam}
              className="text-xs rounded-full px-4 h-9 font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Team
            </Button>

            {!isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAuth}
                className="text-xs rounded-full px-4 h-9 border-white/40 hover:border-white text-white hover:bg-white/10"
              >
                Sign In / Register
              </Button>
            ) : null}

            {/* NOTIFICATION BELL */}
            <NotificationPopover
              onNavigateToTeam={(teamId) => navigate(`/teams/${teamId}`)}
              onNavigateToOpportunity={(oppId) => navigate(`/opportunities/${oppId}`)}
            />

            {/* PROFILE DROPDOWN MENU */}
            {isAuthenticated && currentProfile && (
              <div className="relative">
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#22e873]/50 transition-all focus:outline-none"
                  title={currentProfile.full_name}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-white/30 shadow-sm">
                    {currentProfile.full_name
                      ? currentProfile.full_name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                </button>

                {avatarMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAvatarMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-50 p-2 text-xs text-zinc-300 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-white/10 bg-zinc-900/50 rounded-xl mb-1">
                        <div className="font-bold text-white truncate flex items-center justify-between">
                          <span>{currentProfile.full_name}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#22e873]/15 text-[#22e873] rounded">
                            {currentProfile.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {currentProfile.email}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {currentProfile.college_name || 'University'}
                        </div>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            navigate(`/profile/${currentProfile.id}`);
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-900 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          My Profile
                        </button>

                        <button
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            navigate('/my-teams');
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-900 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          My Teams
                        </button>

                        {currentProfile.role === 'admin' && (
                          <button
                            onClick={() => {
                              setAvatarMenuOpen(false);
                              navigate('/admin');
                            }}
                            className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-900 text-[#22e873] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#22e873]" />
                            Admin Portal
                          </button>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-rose-950/40 text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MOBILE NAVIGATION DRAWER */}
          <div className="flex md:hidden items-center gap-3">
            <NotificationPopover
              onNavigateToTeam={(teamId) => navigate(`/teams/${teamId}`)}
              onNavigateToOpportunity={(oppId) => navigate(`/opportunities/${oppId}`)}
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <RiMenu3Fill className="w-6 h-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[#07090e] border-l border-white/10 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center p-1">
                      <img src="/logo.png" alt="TeamSync" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-base">TeamSync</h2>
                      <p className="text-[10px] text-zinc-400">Collaborative Hub</p>
                    </div>
                  </div>

                  {isAuthenticated && currentProfile ? (
                    <div className="p-3 bg-zinc-900/70 border border-white/10 rounded-xl mb-4">
                      <div className="font-bold text-white text-xs">{currentProfile.full_name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{currentProfile.email}</div>
                      <div className="text-[10px] text-[#22e873] mt-1 font-semibold uppercase">{currentProfile.role}</div>
                    </div>
                  ) : (
                    <div className="mb-4 space-y-2">
                      <Button
                        variant="primary"
                        onClick={onOpenAuth}
                        className="w-full text-xs rounded-full"
                      >
                        Get Started / Sign In
                      </Button>
                    </div>
                  )}

                  <nav className="grid gap-2 py-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                          pathname === item.path
                            ? "bg-[#22e873]/15 text-[#22e873] border border-[#22e873]/30"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    {isAuthenticated && currentProfile && (
                      <Link
                        to={`/profile/${currentProfile.id}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      >
                        <RiAccountBoxFill className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                    )}
                  </nav>

                  <Separator className="my-4 bg-white/10" />

                  <Button
                    variant="primary"
                    onClick={onOpenCreateTeam}
                    className="w-full text-xs rounded-full font-bold flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Create Team
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {isAuthenticated && (
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full text-xs rounded-full flex items-center justify-center gap-2"
                    >
                      <IoMdLogOut /> Sign Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
