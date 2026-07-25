import { useState, useEffect } from "react";

export interface UserLibraryState {
  saved: string[];
  favorites: string[];
  reading: string[];
  read: string[];
  favoriteGenres: string[];
}

const STORAGE_KEY = "bookmatch_user_library_v1";
const PROFILE_KEY = "bookmatch_user_profile_v1";

const INITIAL_LIBRARY: UserLibraryState = {
  saved: ["o-alquimista", "1984"],
  favorites: ["dom-casmurro"],
  reading: ["torto-arado"],
  read: ["dom-casmurro"],
  favoriteGenres: [],
};

export interface LocalProfile {
  name: string;
  location: string;
  reading_since: string;
  bio: string;
  favoriteGenres: string[];
  onboardingDone: boolean;
}

const DEFAULT_PROFILE: LocalProfile = {
  name: "Leitor BookMatch",
  location: "Brasil",
  reading_since: "2024",
  bio: "",
  favoriteGenres: [],
  onboardingDone: false,
};

export function getLocalProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveLocalProfile(profile: LocalProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getLocalLibrary(): UserLibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...INITIAL_LIBRARY, ...JSON.parse(raw) };
  } catch {}
  return INITIAL_LIBRARY;
}

export function saveLocalLibrary(state: UserLibraryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useUserLibrary() {
  const [library, setLibrary] = useState<UserLibraryState>(getLocalLibrary);

  useEffect(() => {
    saveLocalLibrary(library);
  }, [library]);

  const toggleFavorite = (slug: string) => {
    setLibrary((prev) => {
      const isFav = prev.favorites.includes(slug);
      return { ...prev, favorites: isFav ? prev.favorites.filter((s) => s !== slug) : [...prev.favorites, slug] };
    });
  };

  const toggleSaved = (slug: string) => {
    setLibrary((prev) => {
      const isSaved = prev.saved.includes(slug);
      return { ...prev, saved: isSaved ? prev.saved.filter((s) => s !== slug) : [...prev.saved, slug] };
    });
  };

  const setStatus = (slug: string, status: "reading" | "read" | "wishlist") => {
    setLibrary((prev) => {
      const nextReading = prev.reading.filter((s) => s !== slug);
      const nextRead = prev.read.filter((s) => s !== slug);
      const nextSaved = prev.saved.filter((s) => s !== slug);
      if (status === "reading") nextReading.push(slug);
      if (status === "read") nextRead.push(slug);
      if (status === "wishlist") nextSaved.push(slug);
      return { ...prev, reading: nextReading, read: nextRead, saved: nextSaved };
    });
  };

  const setFavoriteGenres = (genres: string[]) => {
    setLibrary((prev) => ({ ...prev, favoriteGenres: genres }));
  };

  return {
    library,
    toggleFavorite,
    toggleSaved,
    setStatus,
    setFavoriteGenres,
    isFavorite: (slug: string) => library.favorites.includes(slug),
    isSaved: (slug: string) => library.saved.includes(slug),
  };
}

/** Hook isolado apenas para perfil local (sem re-render da biblioteca inteira) */
export function useLocalProfile() {
  const [profile, setProfileState] = useState<LocalProfile>(getLocalProfile);

  const saveProfile = (updates: Partial<LocalProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      saveLocalProfile(next);
      return next;
    });
  };

  return { profile, saveProfile };
}
