/**
 * Safe array utility for components
 * Ensures arrays are always arrays, even if data comes as strings from SQLite
 */

export const ensureArray = <T>(value: T[] | string | null | undefined): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    if (value.trim() === '') return [];
    return value.split(',').map(item => item.trim()).filter(Boolean) as T[];
  }
  
  return [];
};

// Specific helpers for common use cases
export const ensureStringArray = (value: string[] | string | null | undefined): string[] => {
  return ensureArray<string>(value);
};

export const safeTags = (tags: string[] | string | null | undefined): string[] => {
  return ensureStringArray(tags);
};

export const safeTechnologies = (technologies: string[] | string | null | undefined): string[] => {
  return ensureStringArray(technologies);
};

export const safeAchievements = (achievements: string[] | string | null | undefined): string[] => {
  return ensureStringArray(achievements);
};
