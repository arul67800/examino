import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export enum TagCategory {
  SOURCES = 'SOURCES',
  EXAMS = 'EXAMS'
}

export interface CreateTagInput {
  name: string;
  category: TagCategory;
  createdBy?: string;
  isPreset?: boolean;
}

export interface UpdateTagInput {
  name?: string;
  usageCount?: number;
  isActive?: boolean;
}

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  // Get all active tags by category
  async getTagsByCategory(category: TagCategory) {
    return this.prisma.tag.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: [
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  // Get all active tags
  async getAllTags() {
    return this.prisma.tag.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  // Create or update a tag (increment usage if exists)
  async createOrUpdateTag(input: CreateTagInput) {
    const existingTag = await this.prisma.tag.findUnique({
      where: {
        name_category: {
          name: input.name.trim(),
          category: input.category
        }
      }
    });

    if (existingTag) {
      // Increment usage count if tag exists
      return this.prisma.tag.update({
        where: { id: existingTag.id },
        data: {
          usageCount: existingTag.usageCount + 1,
          isActive: true // Reactivate if was inactive
        }
      });
    } else {
      // Create new tag
      return this.prisma.tag.create({
        data: {
          name: input.name.trim(),
          category: input.category,
          createdBy: input.createdBy,
          isPreset: input.isPreset || false,
          usageCount: 1
        }
      });
    }
  }

  // Update a tag
  async updateTag(id: string, input: UpdateTagInput) {
    return this.prisma.tag.update({
      where: { id },
      data: input
    });
  }

  // Soft delete a tag (set isActive to false)
  async deactivateTag(id: string) {
    return this.prisma.tag.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Hard delete a tag
  async deleteTag(id: string) {
    return this.prisma.tag.delete({
      where: { id }
    });
  }

  // Get tag by name and category
  async getTagByNameAndCategory(name: string, category: TagCategory) {
    return this.prisma.tag.findUnique({
      where: {
        name_category: {
          name: name.trim(),
          category
        }
      }
    });
  }

  // Initialize preset tags
  async initializePresetTags() {
    const presetTags = {
      SOURCES: [
        'Textbook',
        'NCERT',
        'Reference Book',
        'Study Guide',
        'Online Course',
        'Video Lecture',
        'Reference Material',
        'Research Paper',
        'Academic Journal',
        'Online Resource'
      ],
      EXAMS: [
        'JEE Main',
        'JEE Advanced',
        'NEET',
        'Board Exam',
        'CBSE',
        'ICSE',
        'State Board',
        'Competitive Exam',
        'Mock Test',
        'Practice Test'
      ]
    };

    for (const [category, tagNames] of Object.entries(presetTags)) {
      for (const tagName of tagNames) {
        await this.createOrUpdateTag({
          name: tagName,
          category: category as TagCategory,
          isPreset: true
        });
      }
    }
  }

  // Process tags when creating/updating questions
  async processQuestionTags(sourceTags: string[] = [], examTags: string[] = [], createdBy?: string) {
    const results = {
      sourceTags: [] as any[],
      examTags: [] as any[]
    };

    // Process source tags
    for (const tagName of sourceTags) {
      if (tagName.trim()) {
        const tag = await this.createOrUpdateTag({
          name: tagName,
          category: TagCategory.SOURCES,
          createdBy
        });
        results.sourceTags.push(tag);
      }
    }

    // Process exam tags
    for (const tagName of examTags) {
      if (tagName.trim()) {
        const tag = await this.createOrUpdateTag({
          name: tagName,
          category: TagCategory.EXAMS,
          createdBy
        });
        results.examTags.push(tag);
      }
    }

    return results;
  }
}