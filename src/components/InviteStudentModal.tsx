import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Search } from 'lucide-react';
import { Profile, Team } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';

interface InviteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent?: Profile | null;
  onInvited?: () => void;
}

export const InviteStudentModal: React.FC<InviteStudentModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  onInvited,
}) => {
  const { currentProfile } = useAuth();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [roleOffered, setRoleOffered] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  // Internal student search state
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(targetStudent || null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Profile[]>([]);

  useEffect(() => {
    if (isOpen && currentProfile) {
      setSelectedStudent(targetStudent || null);
      setStudentSearchQuery('');
      db.getTeams().then((teams) => {
        const ledTeams = teams.filter((t) => t.leader_id === currentProfile.id);
        setUserTeams(ledTeams);
        if (ledTeams.length > 0) {
          setSelectedTeamId(ledTeams[0].id);
        }
      });
      db.getProfiles().then((pList) => {
        const filtered = pList.filter(
          (p) =>
            p.role === 'student' &&
            currentProfile &&
            p.id !== currentProfile.id &&
            (!currentProfile.email || p.email !== currentProfile.email)
        );
        setAvailableStudents(filtered);
      });
      setErrorMsg('');
      setNotice('');
    }
  }, [isOpen, currentProfile, targetStudent]);

  if (!isOpen || !currentProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMsg('Please select a student to invite.');
      return;
    }
    if (!selectedTeamId) {
      setErrorMsg('Please select one of your teams to invite this student to.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await db.createInvitation(
        selectedTeamId,
        selectedStudent.id,
        currentProfile.id,
        roleOffered.trim() || 'Team Member',
        message.trim()
      );

      setNotice('Invitation sent successfully!');

      setTimeout(() => {
        if (onInvited) onInvited();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to invite student:', err);
      setErrorMsg(err.message || 'Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = studentSearchQuery.toLowerCase().trim();
  const matchingStudents = availableStudents.filter((s) => {
    if (!q) return true;
    return (
      s.full_name.toLowerCase().includes(q) ||
      (s.college_name && s.college_name.toLowerCase().includes(q)) ||
      (s.branch && s.branch.toLowerCase().includes(q)) ||
      (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#22e873]/10 border border-[#22e873]/30 text-[#22e873] flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate">
                {selectedStudent ? `Invite ${selectedStudent.full_name}` : 'Invite a Student'}
              </h3>
              <p className="text-xs text-zinc-400 truncate">
                {selectedStudent ? 'Send an invitation to join your team' : 'Search and select a builder to invite'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedStudent ? (
          /* STUDENT SEARCH STEP */
          <div className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search students by name, college, or skills..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-zinc-800/60">
              {matchingStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 italic">
                  No students found matching your search.
                </div>
              ) : (
                matchingStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStudent(st)}
                    className="w-full text-left pt-2.5 pb-2.5 px-2 hover:bg-zinc-900/80 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#22e873] transition-colors truncate">
                        {st.full_name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {st.college_name || 'Independent'} {st.year_of_study ? `• ${st.year_of_study}` : ''}
                      </p>
                      {st.branch && (
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{st.branch}</p>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#22e873]/10 text-[#22e873] border border-[#22e873]/30 shrink-0 group-hover:bg-[#22e873] group-hover:text-black transition-colors">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          /* INVITATION FORM STEP */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!targetStudent && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-zinc-400">
                  Inviting: <strong className="text-white">{selectedStudent.full_name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-[#22e873] hover:underline font-medium"
                >
                  ← Change student
                </button>
              </div>
            )}

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

            {userTeams.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                You must be a designated Team Leader of at least one team to invite students. Create a team first!
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Select Team <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:border-[#22e873]"
                  >
                    {userTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.purpose})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Role Offered
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Developer, UI/UX Designer"
                    value={roleOffered}
                    onChange={(e) => setRoleOffered(e.target.value)}
                    className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Personal Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hey, we liked your skills and are building a project for..."
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
                    <UserPlus className="w-3.5 h-3.5 text-black" />
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
