import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capsule } from './Capsule';
import { Button } from './ui/button';
import { Users, Calendar, ArrowRight, ShieldCheck, Bookmark, Share2, Sparkles, UserCheck } from 'lucide-react';
import { Team, Opportunity } from '../types';
import { cn } from '@/lib/utils';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { calculateTeamMatchScore } from '../lib/matchmaking';
import { ShareModal } from './ShareModal';
import GlowCard from './GlowCard';

interface TeamPostCardProps {
  type: 'team';
  item: Team;
  isMember?: boolean;
  onRequestJoin?: (team: Team) => void;
  className?: string;
}

interface OpportunityPostCardProps {
  type: 'opportunity';
  item: Opportunity;
  onCreateTeam?: (oppId: string) => void;
  className?: string;
}

export type PostCardProps = TeamPostCardProps | OpportunityPostCardProps;

export const PostCard: React.FC<PostCardProps> = (props) => {
  const navigate = useNavigate();
  const { currentProfile } = useAuth();
  const { isOpportunitySaved, isTeamSaved, toggleOpportunityBookmark, toggleTeamBookmark } = useBookmarks();
  const { success, info } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (props.type === 'team') {
    const { item: team, isMember, onRequestJoin, className } = props;
    const isSaved = isTeamSaved(team.id);

    const match = currentProfile ? calculateTeamMatchScore(currentProfile, team) : null;

    const handleBookmark = (e: React.MouseEvent) => {
      e.stopPropagation();
      const saved = toggleTeamBookmark(team.id);
      if (saved) {
        success('Saved to Bookmarks', `Team "${team.name}" added to your saved teams.`);
      } else {
        info('Removed from Bookmarks', `Team "${team.name}" removed from saved teams.`);
      }
    };

    const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShareModalOpen(true);
    };

    return (
      <>
        <GlowCard width="100%" height="auto" className={cn("group", className)}>
          <div className="p-5 flex flex-col justify-between space-y-4 h-full">
            <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                    team.status === 'Recruiting'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-[#22e873]/15 text-[#22e873] border border-[#22e873]/30'
                  )}
                >
                  {team.status}
                </span>
                <span className="text-xs text-zinc-400 font-medium">{team.purpose}</span>
              </div>

              <div className="flex items-center gap-1">
                {match && match.score >= 50 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
                      match.score >= 80
                        ? "bg-[#22e873]/20 text-[#22e873] border-[#22e873]/40 shadow-[0_0_10px_rgba(34,232,115,0.2)]"
                        : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                    )}
                    title={match.reasons.join(', ')}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {match.score}% Match
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Share Team"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleBookmark}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isSaved
                      ? "text-[#22e873] bg-[#22e873]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  title={isSaved ? "Remove from bookmarks" : "Bookmark team"}
                >
                  <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-[#22e873]")} />
                </button>
              </div>
            </div>

            <div>
              <h3
                onClick={() => navigate(`/teams/${team.id}`)}
                className="font-bold text-white text-base hover:text-[#22e873] cursor-pointer transition-colors"
              >
                {team.name}
              </h3>
              {team.opportunity && (
                <p className="text-xs text-[#22e873] font-medium mt-0.5">
                  {team.opportunity.title}
                </p>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
              {team.description}
            </p>

            {team.required_roles && team.required_roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {team.required_roles.map((role, idx) => (
                  <Capsule
                    key={idx}
                    item={`Looking for: ${role}`}
                    className="bg-zinc-900/90 text-zinc-300 text-[11px]"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              {team.members?.length || 1} members
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/teams/${team.id}`)}
                className="text-xs rounded-full border-white/20 hover:border-white text-white cursor-pointer"
              >
                Details
              </Button>
              {!isMember && team.status === 'Recruiting' && onRequestJoin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRequestJoin(team)}
                  className="text-xs rounded-full font-bold cursor-pointer"
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      </GlowCard>

        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={`Team: ${team.name}`}
          description={team.description}
          url={`${window.location.origin}/teams/${team.id}`}
        />
      </>
    );
  }

  const { item: opp, onCreateTeam, className } = props;
  const isSaved = isOpportunitySaved(opp.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = toggleOpportunityBookmark(opp.id);
    if (saved) {
      success('Saved to Bookmarks', `Opportunity "${opp.title}" added to your saved opportunities.`);
    } else {
      info('Removed from Bookmarks', `Opportunity "${opp.title}" removed from saved opportunities.`);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "p-6 rounded-2xl border border-white/10 bg-zinc-950/80 hover:border-[#22e873]/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl group relative",
          className
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#22e873] bg-[#22e873]/15 border border-[#22e873]/30 px-2.5 py-0.5 rounded-full">
              {opp.category}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 capitalize">{opp.status}</span>
              <button
                onClick={handleShare}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Share Opportunity"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleBookmark}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isSaved
                    ? "text-[#22e873] bg-[#22e873]/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
                title={isSaved ? "Remove from bookmarks" : "Bookmark opportunity"}
              >
                <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-[#22e873]")} />
              </button>
            </div>
          </div>

          <div>
            <h3
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              className="font-bold text-white text-base hover:text-[#22e873] cursor-pointer transition-colors"
            >
              {opp.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">By {opp.organizer}</p>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
            {opp.short_description}
          </p>

          {opp.rule && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 text-xs text-zinc-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22e873] shrink-0" />
              <span className="truncate">
                {opp.rule.exact_team_size
                  ? `Exact size: ${opp.rule.exact_team_size}`
                  : `Size: ${opp.rule.min_team_size || 1}-${opp.rule.max_team_size || 5}`}
                {opp.rule.composition_rules && opp.rule.composition_rules.length > 0 &&
                  ` • ${opp.rule.composition_rules.map((c) => `${c.count} ${c.target}`).join(', ')}`}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
          <span className="text-zinc-400 text-[11px] capitalize">
            {opp.participation_mode === 'team_required' ? 'Team Required' : 'Solo or Team'}
          </span>

          <div className="flex items-center gap-2">
            {onCreateTeam && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateTeam(opp.id)}
                className="text-xs rounded-full border-white/20 hover:border-white text-white cursor-pointer"
              >
                Create Team
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/opportunities/${opp.id}`)}
              className="text-xs rounded-full flex items-center gap-1 font-bold cursor-pointer"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={opp.title}
        description={opp.short_description}
        url={`${window.location.origin}/opportunities/${opp.id}`}
      />
    </>
  );
};

export default PostCard;
