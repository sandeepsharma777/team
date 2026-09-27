import React, { useState, useEffect } from 'react';
import { X, Users, Sparkles, AlertCircle, Shield, Plus, Trash2 } from 'lucide-react';
import { Opportunity, TeamPurpose, Team, CompositionRule, OpportunityRule } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { COMMON_BRANCHES, YEARS } from '../constants';
import { CollegeAutocomplete } from './CollegeAutocomplete';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
  initialOpportunityId?: string;
}

interface CompositionRuleRowProps {
  cr: { type: 'year' | 'branch' | 'college'; target: string; count: number | string };
  warning?: string;
  onUpdateType: (type: 'year' | 'branch' | 'college') => void;
  onUpdateTarget: (target: string) => void;
  onUpdateCount: (count: any) => void;
  onRemove: () => void;
}

const CompositionRuleRow: React.FC<CompositionRuleRowProps> = ({
  cr,
  warning,
  onUpdateType,
  onUpdateTarget,
  onUpdateCount,
  onRemove,
}) => {
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (cr.type === 'year') {
      const isStandardYear = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'M.Tech'].includes(
        cr.target
      );
      if (isStandardYear) {
        setIsCustom(false);
      } else if (cr.target !== '' && !isCustom) {
        setIsCustom(true);
      }
    } else if (cr.type === 'branch') {
      const isStandardBranch = COMMON_BRANCHES.filter((b) => b !== 'Other').includes(cr.target);
      if (isStandardBranch) {
        setIsCustom(false);
      } else if (cr.target !== '' && !isCustom) {
        setIsCustom(true);
      }
    } else {
      setIsCustom(false);
    }
  }, [cr.type, cr.target]);

  return (
    <div
      className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition-colors ${
        warning
          ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
          : 'bg-zinc-950/70 border-zinc-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* TYPE SELECTOR */}
          <select
            value={cr.type}
            onChange={(e) => onUpdateType(e.target.value as 'year' | 'branch' | 'college')}
            className="text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#22e873] shrink-0"
          >
            <option value="year">Year</option>
            <option value="branch">Branch</option>
            <option value="college">College</option>
          </select>

          {/* YEAR TARGET */}
          {cr.type === 'year' && (
            <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
              <select
                value={isCustom ? 'Other' : cr.target}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setIsCustom(true);
                    onUpdateTarget('');
                  } else {
                    setIsCustom(false);
                    onUpdateTarget(val);
                  }
                }}
                className="text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#22e873] flex-1 min-w-0"
              >
                <option value="" disabled>
                  -- Select Year --
                </option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {isCustom && (
                <input
                  type="text"
                  placeholder="Specify custom year (e.g. 5th Year)"
                  value={cr.target}
                  onChange={(e) => onUpdateTarget(e.target.value)}
                  className="text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873] flex-1 min-w-0"
                />
              )}
            </div>
          )}

          {/* BRANCH TARGET */}
          {cr.type === 'branch' && (
            <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
              <select
                value={isCustom ? 'Other' : cr.target}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setIsCustom(true);
                    onUpdateTarget('');
                  } else {
                    setIsCustom(false);
                    onUpdateTarget(val);
                  }
                }}
                className="text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white focus:outline-none focus:border-[#22e873] flex-1 min-w-0"
              >
                <option value="" disabled>
                  -- Select Branch --
                </option>
                {COMMON_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {isCustom && (
                <input
                  type="text"
                  placeholder="Specify custom branch"
                  value={cr.target}
                  onChange={(e) => onUpdateTarget(e.target.value)}
                  className="text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873] flex-1 min-w-0"
                />
              )}
            </div>
          )}

          {/* COLLEGE TARGET */}
          {cr.type === 'college' && (
            <div className="flex-1 min-w-0">
              <CollegeAutocomplete
                value={cr.target}
                onChange={onUpdateTarget}
                placeholder="e.g. IIT Bombay or enter college"
                className="w-full text-xs rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
          )}
        </div>

        {/* COUNT & REMOVE BUTTON */}
        <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end border-t border-zinc-800/60 pt-2 sm:pt-0 sm:border-t-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-medium">Count:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={cr.count}
              onChange={(e) => onUpdateCount(e.target.value)}
              className={`w-14 text-xs rounded-lg border bg-zinc-900 px-2 py-1.5 text-white text-center focus:outline-none ${
                warning
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-zinc-700 focus:border-[#22e873]'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            title="Remove rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {warning && (
        <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated,
  initialOpportunityId,
}) => {
  const { currentProfile } = useAuth();
  const [purpose, setPurpose] = useState<TeamPurpose>('Hackathon');
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityId, setOpportunityId] = useState<string>(initialOpportunityId || '');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [skillsInput, setSkillsInput] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationNotice, setConfirmationNotice] = useState('');

  // Custom Rules for Personal Project
  const [exactTeamSize, setExactTeamSize] = useState<string>('');
  const [minTeamSize, setMinTeamSize] = useState<string>('');
  const [maxTeamSize, setMaxTeamSize] = useState<string>('');
  const [compositionRules, setCompositionRules] = useState<
    Array<{ type: 'year' | 'branch' | 'college'; target: string; count: number | string }>
  >([]);

  // Compute effective team-size ceiling for Personal Projects
  const exactNum = exactTeamSize.trim() ? parseInt(exactTeamSize.trim(), 10) : null;
  const maxNum = maxTeamSize.trim() ? parseInt(maxTeamSize.trim(), 10) : null;

  const hasExactCeiling = exactNum !== null && !isNaN(exactNum) && exactNum > 0;
  const hasMaxCeiling = maxNum !== null && !isNaN(maxNum) && maxNum > 0;

  const effectiveCeiling: number | null = hasExactCeiling
    ? exactNum
    : hasMaxCeiling
    ? maxNum
    : null;

  const ceilingType: 'exact' | 'max' | null = hasExactCeiling
    ? 'exact'
    : hasMaxCeiling
    ? 'max'
    : null;

  // Compute live validation warnings for composition rules
  const rowWarnings: string[] = [];
  const groupWarnings: string[] = [];

  if (purpose === 'Personal Project' && effectiveCeiling !== null) {
    // 1. Individual rule counts vs ceiling
    compositionRules.forEach((cr, idx) => {
      const cnt = typeof cr.count === 'number' ? cr.count : parseInt(cr.count, 10) || 0;
      if (cnt > effectiveCeiling) {
        rowWarnings[idx] = `This requires more members than your team's ${ceilingType} size allows (${effectiveCeiling}).`;
      } else {
        rowWarnings[idx] = '';
      }
    });

    // 2. Group sum by type (year / branch / college)
    const groupTotals: Record<'year' | 'branch' | 'college', number> = {
      year: 0,
      branch: 0,
      college: 0,
    };

    compositionRules.forEach((cr) => {
      const cnt = typeof cr.count === 'number' ? cr.count : parseInt(cr.count, 10) || 0;
      if (cnt > 0) {
        groupTotals[cr.type] = (groupTotals[cr.type] || 0) + cnt;
      }
    });

    const typeLabels: Record<'year' | 'branch' | 'college', string> = {
      year: 'Year',
      branch: 'Branch',
      college: 'College',
    };

    (['year', 'branch', 'college'] as const).forEach((t) => {
      if (groupTotals[t] > effectiveCeiling) {
        groupWarnings.push(
          `Your ${typeLabels[t]} rules require ${groupTotals[t]} members total, but your team size is only ${effectiveCeiling} — reduce the counts or increase team size.`
        );
      }
    });
  }

  const hasCompositionErrors =
    purpose === 'Personal Project' &&
    (rowWarnings.some((w) => Boolean(w)) || groupWarnings.length > 0);

  useEffect(() => {
    if (isOpen) {
      db.getOpportunities().then((list) => {
        const active = list.filter((o) => o.is_published && o.status !== 'closed');
        setOpportunities(active);
        if (initialOpportunityId) {
          setOpportunityId(initialOpportunityId);
          setPurpose('Hackathon');
        }
      });
      setErrorMsg('');
      setConfirmationNotice('');
      setExactTeamSize('');
      setMinTeamSize('');
      setMaxTeamSize('');
      setCompositionRules([]);
    }
  }, [isOpen, initialOpportunityId]);

  if (!isOpen || !currentProfile) return null;

  const handleAddCompositionRule = () => {
    setCompositionRules((prev) => [...prev, { type: 'year', target: '', count: 1 }]);
  };

  const handleUpdateCompositionRule = (
    index: number,
    field: 'type' | 'target' | 'count',
    value: any
  ) => {
    setCompositionRules((prev) => {
      const next = [...prev];
      if (field === 'type' && next[index].type !== value) {
        next[index] = { ...next[index], type: value, target: '' };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleRemoveCompositionRule = (index: number) => {
    setCompositionRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setErrorMsg('Please provide a team name and project description.');
      return;
    }

    if (purpose === 'Personal Project' && hasCompositionErrors) {
      setErrorMsg('Please resolve composition rule conflicts before creating your team.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const roles = rolesInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      let customRules: Omit<
        OpportunityRule,
        'id' | 'opportunity_id' | 'created_at' | 'updated_at'
      > | null = null;

      if (purpose === 'Personal Project') {
        const exactNum = exactTeamSize.trim() ? parseInt(exactTeamSize.trim(), 10) : null;
        const minNum = minTeamSize.trim() ? parseInt(minTeamSize.trim(), 10) : null;
        const maxNum = maxTeamSize.trim() ? parseInt(maxTeamSize.trim(), 10) : null;

        const validCompositionRules: CompositionRule[] = compositionRules
          .filter((r) => r.target.trim() && Number(r.count) > 0)
          .map((r) => ({
            type: r.type,
            target: r.target.trim(),
            count: typeof r.count === 'number' ? r.count : parseInt(r.count, 10) || 1,
          }));

        const hasExact = exactNum !== null && !isNaN(exactNum) && exactNum > 0;
        const hasMin = minNum !== null && !isNaN(minNum) && minNum > 0;
        const hasMax = maxNum !== null && !isNaN(maxNum) && maxNum > 0;
        const hasComposition = validCompositionRules.length > 0;

        if (hasExact || hasMin || hasMax || hasComposition) {
          customRules = {
            exact_team_size: hasExact ? exactNum : null,
            min_team_size: hasExact ? exactNum : hasMin ? minNum : 1,
            max_team_size: hasExact ? exactNum : hasMax ? maxNum : Math.max(hasMin ? minNum : 1, 10),
            composition_rules: validCompositionRules,
          };
        }
      }

      const createdTeam = await db.createTeam({
        name: name.trim(),
        purpose,
        opportunity_id: purpose !== 'Personal Project' && opportunityId ? opportunityId : null,
        custom_rules: customRules,
        project_name: projectName.trim() || undefined,
        description: description.trim(),
        required_skills: skills.length > 0 ? skills : ['General Development'],
        required_roles: roles.length > 0 ? roles : ['Developer', 'Designer'],
        leader_id: currentProfile.id,
        status: 'Recruiting',
        github_url: githubUrl.trim() || undefined,
        figma_url: figmaUrl.trim() || undefined,
      });

      if (createdTeam) {
        setConfirmationNotice('Team created successfully! Opening your team workspace...');
        setTimeout(() => {
          onTeamCreated(createdTeam);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Failed to create team:', err);
      setErrorMsg(err.message || 'Failed to create team. Please verify all inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-3xl max-w-xl w-full border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22e873]/10 border border-[#22e873]/30 text-[#22e873] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Create a New Team</h3>
              <p className="text-xs text-zinc-400">Assemble builders and recruit collaborators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {confirmationNotice && (
            <div className="p-3 bg-[#22e873]/10 border border-[#22e873]/30 rounded-xl text-[#22e873] text-xs font-mono">
              {confirmationNotice}
            </div>
          )}

          {/* PURPOSE SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Team Purpose <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Hackathon', 'Special Event', 'Personal Project'] as TeamPurpose[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                    purpose === p
                      ? 'border-[#22e873] bg-[#22e873]/10 text-[#22e873] shadow-[0_0_10px_rgba(34,232,115,0.2)]'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* OPPORTUNITY ASSOCIATION (IF APPLICABLE) */}
          {purpose !== 'Personal Project' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Associated Opportunity
              </label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:border-[#22e873]"
              >
                <option value="">-- Select an active opportunity (or leave open) --</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.organizer})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                The team will automatically evaluate rules configured for this opportunity.
              </p>
            </div>
          )}

          {/* PERSONAL PROJECT CUSTOM RULES (OPTIONAL) */}
          {purpose === 'Personal Project' && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#22e873]" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Define Your Own Team Rules (optional)
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Skippable</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Set size constraints or member composition requirements for your project. Leave
                blank if you want an open, unconstrained team.
              </p>

              {/* SIZE LIMITS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Exact Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 2"
                    value={exactTeamSize}
                    onChange={(e) => setExactTeamSize(e.target.value)}
                    className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">Overrides min/max</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 1"
                    disabled={Boolean(exactTeamSize && parseInt(exactTeamSize, 10) > 0)}
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(e.target.value)}
                    className={`w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873] ${
                      exactTeamSize && parseInt(exactTeamSize, 10) > 0
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950'
                        : ''
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">Minimum builders</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 4"
                    disabled={Boolean(exactTeamSize && parseInt(exactTeamSize, 10) > 0)}
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    className={`w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873] ${
                      exactTeamSize && parseInt(exactTeamSize, 10) > 0
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950'
                        : ''
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">Maximum builders</p>
                </div>
              </div>

              {/* COMPOSITION RULES LIST */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-300">
                    Composition Criteria
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCompositionRule}
                    className="text-[11px] text-[#22e873] hover:text-[#4ade80] font-medium flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </button>
                </div>

                {/* GROUP WARNINGS */}
                {groupWarnings.length > 0 && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5">
                    {groupWarnings.map((gw, gIdx) => (
                      <div key={gIdx} className="flex items-start gap-2 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                        <span className="leading-snug">{gw}</span>
                      </div>
                    ))}
                  </div>
                )}

                {compositionRules.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic">
                    No composition criteria added (e.g. year, branch, or college requirements).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {compositionRules.map((cr, idx) => (
                      <CompositionRuleRow
                        key={idx}
                        cr={cr}
                        warning={rowWarnings[idx]}
                        onUpdateType={(type) => handleUpdateCompositionRule(idx, 'type', type)}
                        onUpdateTarget={(target) => handleUpdateCompositionRule(idx, 'target', target)}
                        onUpdateCount={(count) =>
                          handleUpdateCompositionRule(
                            idx,
                            'count',
                            count === '' ? '' : parseInt(count, 10) || 1
                          )
                        }
                        onRemove={() => handleRemoveCompositionRule(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEAM NAME */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Team Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Team Nova, Algorhythm Labs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
            />
          </div>

          {/* PROJECT / IDEA NAME */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Project / Idea Name
            </label>
            <input
              type="text"
              placeholder="e.g. CampusCycle, Decentralized Note Vault"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              What are you building? <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the project goal, scope, and problem you are solving..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
            />
          </div>

          {/* REQUIRED ROLES & SKILLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Roles Looking For
              </label>
              <input
                type="text"
                placeholder="Frontend, UI/UX Designer, ML (comma separated)"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Skills Needed
              </label>
              <input
                type="text"
                placeholder="React, PyTorch, Figma (comma separated)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
          </div>

          {/* EXTERNAL LINKS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                GitHub Repository (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/org/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Figma Workspace (Optional)
              </label>
              <input
                type="url"
                placeholder="https://figma.com/@project"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-800">
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
              <Sparkles className="w-3.5 h-3.5 text-black" />
              {isSubmitting ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
