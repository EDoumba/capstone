const db = require('../models');

async function seedDatabase() {
  try {
    // Insert default languages
    await db.Language.bulkCreate([
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' }
    ], { ignoreDuplicates: true });

    console.log('Default languages inserted');

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await db.User.create({
      email: 'admin@vetconnect.com',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Admin',
      user_type: 'admin'
    });

    // Create user preferences for admin
    await db.UserPreference.create({
      user_id: adminUser.id,
      language_code: 'en',
      email_notifications: true
    });

    console.log('Admin user created');

    // Create sample vets
    const vetPassword = await bcrypt.hash('vet123', 10);
    const vets = await db.User.bulkCreate([
      {
        email: 'dr.smith@vetconnect.com',
        password: vetPassword,
        first_name: 'John',
        last_name: 'Smith',
        user_type: 'vet',
        specialty: 'Surgery',
        bio: 'Board-certified veterinary surgeon with 10 years of experience.',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        rating: 4.8
      },
      {
        email: 'dr.jones@vetconnect.com',
        password: vetPassword,
        first_name: 'Sarah',
        last_name: 'Jones',
        user_type: 'vet',
        specialty: 'Dentistry',
        bio: 'Specialized in veterinary dentistry and oral surgery.',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        rating: 4.9
      }
    ], { ignoreDuplicates: true });

    // Create user preferences for vets
    for (const vet of vets) {
      await db.UserPreference.create({
        user_id: vet.id,
        language_code: 'en',
        email_notifications: true
      });
    }

    console.log('Sample vets created');

    // Create sample availability for vets
    await db.VetAvailability.bulkCreate([
      // Dr. Smith availability
      { vet_id: vets[0].id, day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00' },
      { vet_id: vets[0].id, day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00' },
      { vet_id: vets[0].id, day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00' },
      { vet_id: vets[0].id, day_of_week: 4, start_time: '09:00:00', end_time: '17:00:00' },
      { vet_id: vets[0].id, day_of_week: 5, start_time: '09:00:00', end_time: '15:00:00' },
      
      // Dr. Jones availability
      { vet_id: vets[1].id, day_of_week: 1, start_time: '10:00:00', end_time: '18:00:00' },
      { vet_id: vets[1].id, day_of_week: 2, start_time: '10:00:00', end_time: '18:00:00' },
      { vet_id: vets[1].id, day_of_week: 3, start_time: '10:00:00', end_time: '18:00:00' },
      { vet_id: vets[1].id, day_of_week: 4, start_time: '10:00:00', end_time: '18:00:00' },
      { vet_id: vets[1].id, day_of_week: 6, start_time: '09:00:00', end_time: '14:00:00' }
    ], { ignoreDuplicates: true });

    console.log('Sample vet availability created');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();