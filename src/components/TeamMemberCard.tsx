import React from 'react';
import GlowCard from './GlowCard';
import { Profile } from '../types';
import { Capsule } from './Capsule';
import { Button } from './ui/button';
import { GraduationCap, Sparkles, Share2, Bookmark, UserPlus } from 'lucide-react';

interface TeamMemberCardProps {
  student: Profile;
  matchScore?: number;
  matchReasons?: string[];
  isSaved?: boolean;
  onProfileClick: () => void;
  onInviteClick: () => void;
  onShareClick: () => void;
  onBookmarkClick: (e: React.MouseEvent) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  student,
  matchScore,
  matchReasons = [],
  isSaved = false,
  onProfileClick,
  onInviteClick,
  onShareClick,
  onBookmarkClick,
}) => {
  return (
    <GlowCard width="100%" height="auto" className="group">
      <div className="p-5 flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/15 text-[#22e873] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {student.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  onClick={onProfileClick}
                  className="font-bold text-white text-sm hover:text-[#22e873] cursor-pointer transition-colors truncate"
                >
                  {student.full_name}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-zinc-500" />
                  {student.college_name} • {student.year_of_study}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {matchScore !== undefined && matchScore >= 50 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22e873]/15 text-[#22e873] border border-[#22e873]/30 flex items-center gap-1"
                  title={matchReasons.join(', ')}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {matchScore}% Match
                </span>
              )}
              <button
                onClick={onShareClick}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Share Builder Profile"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onBookmarkClick}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isSaved
                    ? 'text-[#22e873] bg-[#22e873]/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save builder'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#22e873]' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
            {student.bio || `${student.branch} student looking to collaborate on projects.`}
          </p>

          {student.skills && student.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {student.skills.slice(0, 4).map((s, idx) => (
                <Capsule key={idx} item={s} className="text-[11px]" />
              ))}
              {student.skills.length > 4 && (
                <span className="text-[10px] text-zinc-500 self-center">
                  +{student.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onProfileClick}
            className="text-xs rounded-full border-white/20 text-zinc-300 hover:text-white cursor-pointer"
          >
            Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onInviteClick}
            className="text-xs rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </Button>
        </div>
      </div>
    </GlowCard>
  );
};

export default TeamMemberCard;
