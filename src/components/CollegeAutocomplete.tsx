import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { College } from '../types';
import { db } from '../services/db';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  colleges?: College[];
}

export const CollegeAutocomplete: React.FC<CollegeAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'e.g. IIT Bombay or enter your college',
  id,
  required = false,
  className = 'w-full text-xs rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#22e873]',
  colleges: propColleges,
}) => {
  const [colleges, setColleges] = useState<College[]>(propColleges || []);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propColleges && propColleges.length > 0) {
      setColleges(propColleges);
    } else {
      db.getColleges().then((list) => {
        setColleges(list);
      });
    }
  }, [propColleges]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const trimmedQuery = value.trim().toLowerCase();
  const matches = trimmedQuery
    ? colleges.filter((c) => c.name.toLowerCase().includes(trimmedQuery)).slice(0, 10)
    : [];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        id={id}
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => {
          if (value.trim()) {
            setShowDropdown(true);
          }
        }}
        autoComplete="off"
        className={className}
      />

      {showDropdown && value.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-56 overflow-y-auto divide-y divide-zinc-800">
          {matches.length > 0 ? (
            matches.map((col) => (
              <button
                key={col.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur before click registers
                  onChange(col.name);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-800/90 transition-colors flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[#22e873]/15 border border-[#22e873]/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#22e873]" />
                  </div>
                  <span className="text-xs text-zinc-200 group-hover:text-white font-medium truncate">
                    {col.name}
                  </span>
                </div>

                <span className="text-[10px] bg-[#22e873]/15 text-[#22e873] border border-[#22e873]/30 px-2 py-0.5 rounded-full font-semibold shrink-0 flex items-center gap-1 shadow-xs">
                  <Check className="w-2.5 h-2.5" />
                  <span>Verified</span>
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-left text-xs text-zinc-400">
              <span className="block text-zinc-300 font-medium">Custom Institution</span>
              <span className="text-[11px] text-zinc-500">
                No directory matches — you can continue with "{value}".
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
