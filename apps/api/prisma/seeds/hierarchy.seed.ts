import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const hierarchyData = [
  {
    id: 'first-year',
    name: 'First Year',
    level: 1,
    type: 'Year',
    color: '#8B5CF6',
    order: 1,
    questionCount: 0,
    children: [
      {
        id: 'anatomy',
        name: 'Anatomy',
        level: 2,
        type: 'Subject',
        color: '#7C3AED',
        order: 1,
        questionCount: 0,
        children: [
          {
            id: 'upper-limb',
            name: 'Upper Limb',
            level: 3,
            type: 'Part',
            color: '#10B981',
            order: 1,
            questionCount: 0,
            children: [
              {
                id: 'shoulder-region',
                name: 'Shoulder Region',
                level: 4,
                type: 'Section',
                color: '#059669',
                order: 1,
                questionCount: 0,
                children: [
                  {
                    id: 'shoulder-anatomy',
                    name: 'Basic Shoulder Anatomy',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 1,
                    questionCount: 12
                  },
                  {
                    id: 'shoulder-movements',
                    name: 'Shoulder Movements',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 8
                  },
                  {
                    id: 'shoulder-muscles',
                    name: 'Shoulder Muscles',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 3,
                    questionCount: 15
                  }
                ]
              },
              {
                id: 'arm-region',
                name: 'Arm Region',
                level: 4,
                type: 'Section',
                color: '#059669',
                order: 2,
                questionCount: 0,
                children: [
                  {
                    id: 'arm-muscles',
                    name: 'Arm Muscles',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 1,
                    questionCount: 10
                  },
                  {
                    id: 'arm-nerves',
                    name: 'Arm Innervation',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 7
                  }
                ]
              }
            ]
          },
          {
            id: 'lower-limb',
            name: 'Lower Limb',
            level: 3,
            type: 'Part',
            color: '#10B981',
            order: 2,
            questionCount: 0,
            children: [
              {
                id: 'thigh-region',
                name: 'Thigh Region',
                level: 4,
                type: 'Section',
                color: '#059669',
                order: 1,
                questionCount: 0,
                children: [
                  {
                    id: 'thigh-muscles',
                    name: 'Thigh Muscles',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 1,
                    questionCount: 13
                  },
                  {
                    id: 'thigh-vessels',
                    name: 'Thigh Vessels',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 9
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'physiology',
        name: 'Physiology',
        level: 2,
        type: 'Subject',
        color: '#7C3AED',
        order: 2,
        questionCount: 0,
        children: [
          {
            id: 'cardiovascular',
            name: 'Cardiovascular System',
            level: 3,
            type: 'Part',
            color: '#EF4444',
            order: 1,
            questionCount: 0,
            children: [
              {
                id: 'heart-physiology',
                name: 'Heart Physiology',
                level: 4,
                type: 'Section',
                color: '#DC2626',
                order: 1,
                questionCount: 0,
                children: [
                  {
                    id: 'cardiac-cycle',
                    name: 'Cardiac Cycle',
                    level: 5,
                    type: 'Chapter',
                    color: '#B91C1C',
                    order: 1,
                    questionCount: 15
                  },
                  {
                    id: 'heart-conduction',
                    name: 'Heart Conduction System',
                    level: 5,
                    type: 'Chapter',
                    color: '#B91C1C',
                    order: 2,
                    questionCount: 12
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'second-year',
    name: 'Second Year',
    level: 1,
    type: 'Year',
    color: '#8B5CF6',
    order: 2,
    questionCount: 0,
    children: [
      {
        id: 'pathology',
        name: 'Pathology',
        level: 2,
        type: 'Subject',
        color: '#7C3AED',
        order: 1,
        questionCount: 0,
        children: [
          {
            id: 'general-pathology',
            name: 'General Pathology',
            level: 3,
            type: 'Part',
            color: '#6366F1',
            order: 1,
            questionCount: 0,
            children: [
              {
                id: 'inflammation',
                name: 'Inflammation',
                level: 4,
                type: 'Section',
                color: '#4F46E5',
                order: 1,
                questionCount: 0,
                children: [
                  {
                    id: 'acute-inflammation',
                    name: 'Acute Inflammation',
                    level: 5,
                    type: 'Chapter',
                    color: '#4338CA',
                    order: 1,
                    questionCount: 16
                  },
                  {
                    id: 'chronic-inflammation',
                    name: 'Chronic Inflammation',
                    level: 5,
                    type: 'Chapter',
                    color: '#4338CA',
                    order: 2,
                    questionCount: 13
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export async function seedHierarchyData() {
  console.log('🌱 Starting hierarchy data seeding...');

  // Clear existing data
  await prisma.hierarchyItem.deleteMany();
  console.log('🧹 Cleared existing hierarchy data');

  // Function to create items recursively
  async function createHierarchyItems(items: any[], parentId?: string) {
    for (const item of items) {
      const { children, ...itemData } = item;
      
      // Create the item
      const createdItem = await prisma.hierarchyItem.create({
        data: {
          ...itemData,
          parentId
        }
      });
      
      console.log(`✅ Created ${itemData.type}: ${itemData.name}`);
      
      // Create children if they exist
      if (children && children.length > 0) {
        await createHierarchyItems(children, createdItem.id);
      }
    }
  }

  await createHierarchyItems(hierarchyData);
  
  console.log('🎉 Hierarchy data seeding completed!');
}