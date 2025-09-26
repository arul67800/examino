import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class QuestionIdGenerator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a human-readable question ID based on hierarchy
   * Format: SUBJECT-PART-SECTION-CHAPTER-Q###
   * Example: ANAT-UL-SR-BSA-Q001, PHYS-CVS-H-SA-Q045
   */
  async generateHumanReadableId(hierarchyItemId: string): Promise<string> {
    // Get the hierarchy path for this item
    const hierarchyPath = await this.getHierarchyPath(hierarchyItemId);
    
    // Create abbreviations for each level
    const abbreviations = hierarchyPath.map(item => this.createAbbreviation(item.name));
    
    // Get next question number for this hierarchy item
    const questionCount = await this.getNextQuestionNumber(hierarchyItemId);
    
    // Format: SUBJECT-PART-SECTION-CHAPTER-Q###
    const baseId = abbreviations.join('-');
    const questionNumber = questionCount.toString().padStart(3, '0');
    
    return `${baseId}-Q${questionNumber}`;
  }

  /**
   * Get the full hierarchy path from subject to chapter
   */
  private async getHierarchyPath(hierarchyItemId: string) {
    const item = await this.prisma.hierarchyItem.findUnique({
      where: { id: hierarchyItemId },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!item) {
      throw new Error('Hierarchy item not found');
    }

    // Build path from subject to current level
    const path: any[] = [];
    let current: any = item;
    
    // Add current item
    path.unshift(current);
    
    // Traverse up to get all parents
    while (current.parent) {
      current = current.parent;
      path.unshift(current);
    }

    // We want path from Subject (level 2) to Chapter (level 5)
    // Filter to get only levels 2-5 (Subject, Part, Section, Chapter)
    return path.filter(item => item.level >= 2 && item.level <= 5);
  }

  /**
   * Get the next question number for a specific hierarchy item
   */
  private async getNextQuestionNumber(hierarchyItemId: string): Promise<number> {
    const questionsCount = await this.prisma.question.count({
      where: { hierarchyItemId }
    });
    
    return questionsCount + 1;
  }

  /**
   * Create an abbreviation from a name
   * Rules:
   * 1. Take first letters of each word
   * 2. If single word, take first 3-4 characters
   * 3. Remove common words (of, the, and, etc.)
   * 4. Uppercase result
   */
  private createAbbreviation(name: string): string {
    // Common words to ignore
    const skipWords = ['of', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with'];
    
    // Split into words and filter out common words
    const words = name
      .toLowerCase()
      .split(' ')
      .filter(word => !skipWords.includes(word) && word.length > 0);

    if (words.length === 0) {
      return name.substring(0, 3).toUpperCase();
    }

    if (words.length === 1) {
      // Single word - take first 3-4 characters
      const word = words[0];
      if (word.length <= 4) {
        return word.toUpperCase();
      }
      // For longer words, try to find natural break points (vowels)
      const consonants = word.replace(/[aeiou]/g, '');
      if (consonants.length >= 3) {
        return consonants.substring(0, 3).toUpperCase();
      }
      return word.substring(0, 4).toUpperCase();
    }

    // Multiple words - take first letter of each word
    let abbrev = words.map(word => word[0]).join('');
    
    // If too long, take first 4 characters
    if (abbrev.length > 4) {
      abbrev = abbrev.substring(0, 4);
    }
    
    // If too short, pad with characters from first word
    if (abbrev.length < 2 && words[0].length > 1) {
      abbrev = words[0].substring(0, Math.min(3, words[0].length));
    }

    return abbrev.toUpperCase();
  }

  /**
   * Validate that a human ID is unique
   */
  async isHumanIdUnique(humanId: string): Promise<boolean> {
    const existing = await this.prisma.question.findUnique({
      where: { humanId }
    });
    
    return !existing;
  }

  /**
   * Generate a unique human ID, handling collisions
   */
  async generateUniqueHumanId(hierarchyItemId: string): Promise<string> {
    let baseId = await this.generateHumanReadableId(hierarchyItemId);
    let counter = 1;
    
    // If there's a collision, append a suffix
    while (!(await this.isHumanIdUnique(baseId))) {
      // Remove the Q### part and add a suffix
      const parts = baseId.split('-');
      const questionPart = parts.pop(); // Remove Q###
      const basePart = parts.join('-');
      
      // Extract number from Q###
      const questionNumber = questionPart?.replace('Q', '') || '001';
      const nextNumber = (parseInt(questionNumber) + counter).toString().padStart(3, '0');
      
      baseId = `${basePart}-Q${nextNumber}`;
      counter++;
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        throw new Error('Unable to generate unique question ID');
      }
    }
    
    return baseId;
  }
}