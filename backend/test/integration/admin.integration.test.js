const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('../utils/mongoMemory');

beforeAll(async () => {
  await connect();
  
  require('../../src/models/coreModels/Admin');
  require('../../src/models/coreModels/AdminPassword');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test('Admin model: create and read from in-memory mongo', async () => {
  const Admin = mongoose.model('Admin');

  const adminData = {
    email: 'integration@example.com',
    name: 'Integration',
    surname: 'Tester',
    enabled: true,
  };

  const created = await Admin.create(adminData);

  expect(created).toHaveProperty('_id');
  expect(created.email).toBe(adminData.email);

  const found = await Admin.findOne({ email: adminData.email }).lean();
  expect(found).not.toBeNull();
  expect(found.name).toBe(adminData.name);
  expect(found.enabled).toBe(true);
});

test('AdminPassword: unique constraint and validation checks', async () => {
  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');

  const admin = await Admin.create({ email: 'val2-ap@example.com', name: 'ValAP2', enabled: true });

  const salt = 'u-salt2';
  const plain = 'u-pass2';
  const hashed = require('bcryptjs').hashSync(salt + plain);

  // ensure indexes exist (may be no-op)
  try {
    await AdminPassword.createIndexes();
  } catch (e) {}

  const first = await AdminPassword.create({ user: admin._id, salt, password: hashed });
  expect(first).toHaveProperty('_id');

  // duplicate should fail
  let threw = false;
  try {
    await AdminPassword.create({ user: admin._id, salt: 'x', password: hashed });
  } catch (err) {
    threw = true;
    expect(err).toBeDefined();
  }
  expect(threw).toBe(true);

  // missing password validation
  threw = false;
  try {
    await AdminPassword.create({ user: admin._id, salt: 's' });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);
});
