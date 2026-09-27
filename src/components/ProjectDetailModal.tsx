import React, { useState } from 'react';
import { X, Github, ExternalLink, Heart, Tag, User, Layers, Calendar } from 'lucide-react';
import { Project } from '../types';
import { Button } from './ui/button';
import { Capsule } from './Capsule';
import { useToast } from '../context/ToastContext';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onNavigateToAuthor?: (profileId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onNavigateToAuthor,
}) => {
  const { success } = useToast();
  const [likes, setLikes] = useState<number>(() => Math.floor(Math.random() * 15) + 3);
  const [hasLiked, setHasLiked] = useState(false);

  if (!isOpen || !project) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      success('Upvoted Project!', `You upvoted "${project.title}".`);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-3xl max-w-xl w-full border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#22e873]/10 border border-[#22e873]/30 text-[#22e873] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate">{project.title}</h3>
              <p className="text-xs text-zinc-400 capitalize">{project.status} Project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#22e873]/15 text-[#22e873] border border-[#22e873]/30">
                {project.category || 'Engineering'}
              </span>
              <span className="text-[11px] text-zinc-400">
                Status: <strong className="text-zinc-200 capitalize">{project.status}</strong>
              </span>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-rose-500/40 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-bold">{likes} Upvotes</span>
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1.5">About this Project</h4>
            <p className="text-zinc-300 leading-relaxed text-xs whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {project.outcome && (
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
              <span className="font-bold text-[#22e873] text-xs">Hackathon Outcome / Impact</span>
              <p className="text-zinc-300 text-xs leading-relaxed">{project.outcome}</p>
            </div>
          )}

          {project.skills_used && project.skills_used.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-zinc-300 text-xs">Tech Stack & Technologies</span>
              <div className="flex flex-wrap gap-1.5">
                {project.skills_used.map((skill, idx) => (
                  <Capsule key={idx} item={skill} className="text-xs" />
                ))}
              </div>
            </div>
          )}

          {/* AUTHOR CARD */}
          {project.creator && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-[#22e873] font-bold text-xs flex items-center justify-center shrink-0">
                  {project.creator.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-white text-xs truncate">{project.creator.full_name}</h5>
                  <p className="text-[11px] text-zinc-400 truncate">{project.creator.college_name}</p>
                </div>
              </div>

              {onNavigateToAuthor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToAuthor(project.creator!.id)}
                  className="text-xs rounded-full border-white/20"
                >
                  View Profile
                </Button>
              )}
            </div>
          )}

          {/* EXTERNAL REPO & DEMO LINKS */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> Repository
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#22e873]/15 hover:bg-[#22e873]/25 border border-[#22e873]/40 text-[#22e873] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
