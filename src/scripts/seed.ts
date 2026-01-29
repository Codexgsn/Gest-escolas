
import { Pool } from '@neondatabase/serverless';
import { createResourcesTable, createUsersTable, createReservationsTable } from '../lib/schema';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('Creating tables...');
    await createUsersTable(client);
    await createResourcesTable(client);
    await createReservationsTable(client);
    console.log('Tables created successfully.');

    console.log('Seeding users...');
    await client.query(`
      INSERT INTO users (id, name, email, role)
      VALUES
        ('410544b2-4001-4271-9855-fec4b6a6442a', 'Admin User', 'admin@example.com', 'Admin'),
        ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Regular User', 'user@example.com', 'User')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Seeding resources...');
    await client.query(`
      INSERT INTO resources (id, name, type, location, capacity, equipment, "imageUrl", tags)
      VALUES
        ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sala de Reunião 1', 'Sala', 'Bloco A', 10, '{"Projetor", "Quadro Branco"}', 'https://via.placeholder.com/150', '{"reuniao", "apresentacao"}'),
        ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Projetor Epson', 'Equipamento', 'Sala de TI', 1, '{"Cabo HDMI", "Cabo VGA"}', 'https://via.placeholder.com/150', '{"projetor", "apresentacao"}')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Seeding reservations...');
    await client.query(`
      INSERT INTO reservations (id, "resourceId", "userId", "startTime", "endTime")
      VALUES
        ('a56e1573-2169-4b69-8692-23c6d8d672a6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '410544b2-4001-4271-9855-fec4b6a6442a', '2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
