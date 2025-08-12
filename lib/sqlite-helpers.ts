/**
 * Utility functions for handling array data in SQLite
 * Since SQLite doesn't support arrays, we store them as comma-separated strings
 */

export const arrayToString = (arr: string[]): string => {
  if (!arr || arr.length === 0) return '';
  return arr.join(',');
};

export const stringToArray = (str: string): string[] => {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

export const addToArray = (currentStr: string, newItem: string): string => {
  const currentArray = stringToArray(currentStr);
  if (!currentArray.includes(newItem)) {
    currentArray.push(newItem);
  }
  return arrayToString(currentArray);
};

export const removeFromArray = (currentStr: string, itemToRemove: string): string => {
  const currentArray = stringToArray(currentStr);
  const filteredArray = currentArray.filter(item => item !== itemToRemove);
  return arrayToString(filteredArray);
};

// Type definitions for better type safety
export interface PortfolioWithArrays {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostWithArrays {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  technology: string;
  published: boolean;
  authorId: string;
  tags: string[];
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
}

// Transform functions for API responses
export const transformPortfolioForAPI = (portfolio: any): PortfolioWithArrays => ({
  ...portfolio,
  technologies: stringToArray(portfolio.technologies),
  achievements: stringToArray(portfolio.achievements),
});

export const transformBlogPostForAPI = (post: any): BlogPostWithArrays => ({
  ...post,
  tags: stringToArray(post.tags),
});

// Transform functions for database storage
export const transformPortfolioForDB = (portfolio: Partial<PortfolioWithArrays>) => ({
  ...portfolio,
  technologies: portfolio.technologies ? arrayToString(portfolio.technologies) : '',
  achievements: portfolio.achievements ? arrayToString(portfolio.achievements) : '',
});

export const transformBlogPostForDB = (post: Partial<BlogPostWithArrays>) => ({
  ...post,
  tags: post.tags ? arrayToString(post.tags) : '',
});
