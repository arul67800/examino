import { seedHierarchyData } from './hierarchy.seed';

async function main() {
  try {
    await seedHierarchyData();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ All seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });