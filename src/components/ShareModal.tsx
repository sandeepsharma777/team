import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, MessageCircle, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url = window.location.href,
  description = 'Check this out on TeamSync — Connect, Collaborate & Build together!',
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success('Link copied to clipboard!', url);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareText = encodeURIComponent(`${title} - ${description}`);
  const shareUrl = encodeURIComponent(url);

  const twitterShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22e873]/10 border border-[#22e873]/30 text-[#22e873] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Share</h3>
              <p className="text-xs text-zinc-400">Share with prospective teammates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h4 className="font-bold text-white text-sm truncate">{title}</h4>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{description}</p>
          </div>

          {/* COPY LINK BOX */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400">Direct Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 text-xs rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-300 focus:outline-none select-all"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={handleCopy}
                className="shrink-0 text-xs rounded-xl px-3 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* SOCIAL PLATFORM BUTTONS */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="text-[11px] font-semibold text-zinc-400">Share on Social</label>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={whatsappShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-xs text-zinc-200 transition-all font-medium"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
              <a
                href={twitterShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 hover:bg-sky-950/20 text-xs text-zinc-200 transition-all font-medium"
              >
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Twitter</span>
              </a>
              <a
                href={linkedInShare}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-xs text-zinc-200 transition-all font-medium"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
