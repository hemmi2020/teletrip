/**
 * One-off script to promote a user account to admin role.
 * Usage: node promoteAdmin.js user@example.com
 *
 * Requires DB_CONNECT to be set in the environment (same value used on Render).
 * Run this either:
 *  - Locally, with DB_CONNECT set to your production Mongo URI, OR
 *  - Via Render's Shell tab for the Backend service (env vars already loaded there).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./models/user.model');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node promoteAdmin.js <email>');
    process.exit(1);
  }

  const dbUri = process.env.DB_CONNECT;
  if (!dbUri) {
    console.error('DB_CONNECT is not set in the environment. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('Connected to database.');

  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found user: ${user.email}, current role: ${user.role || 'user'}`);
  user.role = 'admin';
  await user.save();
  console.log(`✅ ${user.email} is now role: ${user.role}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
