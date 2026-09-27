import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { Team } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onRequestSent?: () => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  isOpen,
  onClose,
  team,
  onRequestSent,
}) => {
  const { currentProfile } = useAuth();
  const [roleInterested, setRoleInterested] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  if (!isOpen || !team || !currentProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await db.createJoinRequest(
        team.id,
        currentProfile.id,
        roleInterested.trim() || 'General Member',
        message.trim()
      );

      setNotice('Join request submitted successfully!');

      setTimeout(() => {
        if (onRequestSent) onRequestSent();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to submit join request:', err);
      setErrorMsg(err.message || 'Failed to submit join request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h3 className="font-bold text-white text-sm">Request to Join {team.name}</h3>
            <p className="text-xs text-zinc-400">The team leader will review your request</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {notice && (
            <div className="p-3 bg-[#22e873]/10 border border-[#22e873]/30 rounded-xl text-[#22e873] text-xs font-mono">
              {notice}
            </div>
          )}

          {team.required_roles && team.required_roles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Desired Role
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {team.required_roles.map((r, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setRoleInterested(r)}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                      roleInterested === r
                        ? 'bg-[#22e873] text-black font-bold border-[#22e873] shadow-[0_0_10px_rgba(34,232,115,0.3)]'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type a custom role (e.g. Frontend Developer)"
                value={roleInterested}
                onChange={(e) => setRoleInterested(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Why do you want to join? (Short note)
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell the team leader about your relevant skills, past work, and how you want to contribute..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-full bg-[#22e873] hover:bg-[#4ade80] text-black transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,232,115,0.3)] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              {isSubmitting ? 'Sending Request...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
