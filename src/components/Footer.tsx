import React from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { FaXTwitter, FaProductHunt } from "react-icons/fa6";
import { Shield, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#03060a] border-t border-white/10 text-zinc-300 relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
        {/* Brand Info */}
        <div className="space-y-4 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/20 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(34,232,115,0.2)]">
              <img
                src="/logo.png"
                alt="TeamSync Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TeamSync</span>
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Team up for success in every hackathon and collegiate competition. Build your dream cross-functional team with automated composition rule verification.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white tracking-wide">Platform</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>
              <Link to="/discover" className="hover:text-[#22e873] transition-colors flex items-center gap-1">
                Discover Builders
              </Link>
            </li>
            <li>
              <Link to="/opportunities" className="hover:text-[#22e873] transition-colors flex items-center gap-1">
                Hackathons & Challenges
              </Link>
            </li>
            <li>
              <Link to="/my-teams" className="hover:text-[#22e873] transition-colors flex items-center gap-1">
                My Teams & Involvements
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-[#22e873] transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#22e873]" /> Organizer Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Supported & Open Ecosystem */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white tracking-wide">Community & Ecosystem</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Connecting student innovators, developers, designers, and hackathon organizers across universities worldwide.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#22e873]/10 border border-[#22e873]/30 text-[#22e873] text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Team Matchmaking
            </span>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white tracking-wide">Connect</h3>
          <ul className="space-y-2 text-zinc-400">
            <li>
              <a
                href="https://github.com/harsh3dev/DevMatchups"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1 hover:text-white transition-colors"
              >
                GitHub Repository
                <MdArrowOutward className="transition-opacity opacity-0 group-hover:opacity-100" />
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@teamsync.edu"
                className="group flex items-center gap-1 hover:text-white transition-colors"
              >
                contact@teamsync.edu
                <MdArrowOutward className="transition-opacity opacity-0 group-hover:opacity-100" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-zinc-500 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          © {new Date().getFullYear()} TeamSync. Built for student builders and collegiate innovation hackathons.
        </p>
        <div className="flex items-center gap-5 text-lg text-zinc-400">
          <a
            href="https://github.com/harsh3dev/DevMatchups"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            title="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#339dfa] transition-colors"
            title="Twitter"
          >
            <FaXTwitter />
          </a>
          <a
            href="https://producthunt.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors"
            title="ProductHunt"
          >
            <FaProductHunt />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
