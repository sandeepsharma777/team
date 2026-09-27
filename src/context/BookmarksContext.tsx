import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BookmarksContextType {
  savedOpportunityIds: string[];
  savedTeamIds: string[];
  savedProfileIds: string[];
  isOpportunitySaved: (id: string) => boolean;
  isTeamSaved: (id: string) => boolean;
  isProfileSaved: (id: string) => boolean;
  toggleOpportunityBookmark: (id: string) => boolean;
  toggleTeamBookmark: (id: string) => boolean;
  toggleProfileBookmark: (id: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const STORAGE_KEYS = {
  OPPS: 'teamsync_saved_opportunities',
  TEAMS: 'teamsync_saved_teams',
  PROFILES: 'teamsync_saved_profiles',
};

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OPPS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [savedTeamIds, setSavedTeamIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [savedProfileIds, setSavedProfileIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPPS, JSON.stringify(savedOpportunityIds));
  }, [savedOpportunityIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(savedTeamIds));
  }, [savedTeamIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(savedProfileIds));
  }, [savedProfileIds]);

  const isOpportunitySaved = useCallback(
    (id: string) => savedOpportunityIds.includes(id),
    [savedOpportunityIds]
  );

  const isTeamSaved = useCallback(
    (id: string) => savedTeamIds.includes(id),
    [savedTeamIds]
  );

  const isProfileSaved = useCallback(
    (id: string) => savedProfileIds.includes(id),
    [savedProfileIds]
  );

  const toggleOpportunityBookmark = useCallback((id: string): boolean => {
    let nowSaved = false;
    setSavedOpportunityIds((prev) => {
      if (prev.includes(id)) {
        nowSaved = false;
        return prev.filter((item) => item !== id);
      } else {
        nowSaved = true;
        return [...prev, id];
      }
    });
    return nowSaved;
  }, []);

  const toggleTeamBookmark = useCallback((id: string): boolean => {
    let nowSaved = false;
    setSavedTeamIds((prev) => {
      if (prev.includes(id)) {
        nowSaved = false;
        return prev.filter((item) => item !== id);
      } else {
        nowSaved = true;
        return [...prev, id];
      }
    });
    return nowSaved;
  }, []);

  const toggleProfileBookmark = useCallback((id: string): boolean => {
    let nowSaved = false;
    setSavedProfileIds((prev) => {
      if (prev.includes(id)) {
        nowSaved = false;
        return prev.filter((item) => item !== id);
      } else {
        nowSaved = true;
        return [...prev, id];
      }
    });
    return nowSaved;
  }, []);

  return (
    <BookmarksContext.Provider
      value={{
        savedOpportunityIds,
        savedTeamIds,
        savedProfileIds,
        isOpportunitySaved,
        isTeamSaved,
        isProfileSaved,
        toggleOpportunityBookmark,
        toggleTeamBookmark,
        toggleProfileBookmark,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = (): BookmarksContextType => {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
};
