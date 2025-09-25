// This file now exports utility functions for hierarchy management
// All data is fetched from GraphQL API instead of dummy data

export const academicHierarchyData: any[] = []; // Empty - now using GraphQL data

export const getTypeByLevel = (level: number) => {
  switch (level) {
    case 1: return 'Year';
    case 2: return 'Subject';
    case 3: return 'Part';
    case 4: return 'Section';
    case 5: return 'Chapter';
    default: return 'Item';
  }
};