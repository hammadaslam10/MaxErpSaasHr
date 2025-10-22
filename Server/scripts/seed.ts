#!/usr/bin/env ts-node

import { seedDatabase } from '../src/database/seeder';

async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
