import React from 'react';
import { ShieldCheck, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { RuleValidationResult } from '../types';

interface RuleEngineBadgeProps {
  validation: RuleValidationResult;
  showBreakdown?: boolean;
}

export const RuleEngineBadge: React.FC<RuleEngineBadgeProps> = ({
  validation,
  showBreakdown = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors">
        {validation.isEligible ? (
          <span className="inline-flex items-center gap-1.5 text-[#22e873] bg-[#22e873]/10 border border-[#22e873]/30 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(34,232,115,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22e873]" />
            <span className="font-semibold">Team Rules Satisfied</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Rule Requirements Pending</span>
          </span>
        )}
      </div>

      {showBreakdown && validation.breakdown.length > 0 && (
        <div className="mt-2 p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-xs space-y-2.5 backdrop-blur-md">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Configured Team Composition & Size Rules</span>
          </div>
          <div className="space-y-1.5">
            {validation.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-zinc-950 border border-zinc-850"
              >
                <div className="flex items-center gap-1.5">
                  {item.satisfied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22e873]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-zinc-300">{item.ruleLabel}</span>
                </div>
                <div className="font-mono text-[11px]">
                  <span
                    className={
                      item.satisfied
                        ? 'text-[#22e873] font-bold'
                        : 'text-amber-400 font-bold'
                    }
                  >
                    {item.current}
                  </span>
                  <span className="text-zinc-500"> / {item.required} req</span>
                </div>
              </div>
            ))}
          </div>
          {validation.messages.length > 0 && (
            <div className="pt-1 text-[11px] text-zinc-400">
              {validation.messages.map((msg, i) => (
                <p key={i} className="flex items-start gap-1">
                  • {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
