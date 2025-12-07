const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('../utils/mongoMemory');

beforeAll(async () => {
  await connect();
  require('../../src/models/coreModels/Admin');
  require('../../src/models/appModels/Client');
  require('../../src/models/appModels/Invoice');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test('Invoice: Create invoice with items and associate client/admin', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');

  const admin = await Admin.create({ email: 'inv-admin@example.com', name: 'Inv', enabled: true });
  const client = await Client.create({ name: 'Client A', email: 'client@example.com' });

  const invoiceData = {
    createdBy: admin._id,
    number: 1001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [
      { itemName: 'Item 1', quantity: 2, price: 10, total: 20 },
      { itemName: 'Item 2', quantity: 1, price: 5, total: 5 },
    ],
    currency: 'USD',
    total: 25,
  };

  const inv = await Invoice.create(invoiceData);
  expect(inv).toHaveProperty('_id');
  expect(inv.number).toBe(1001);

  const found = await Invoice.findOne({ _id: inv._id }).populate('client createdBy').lean();
  expect(found).not.toBeNull();
  expect(found.client.name).toBe('Client A');
  expect(found.items).toHaveLength(2);
  expect(found.total).toBe(25);
});

test('Invoice: deleting client leaves invoice referencing missing client (populate yields null)', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');

  const admin = await Admin.create({ email: 'inv2-admin@example.com', name: 'Inv2', enabled: true });
  const client = await Client.create({ name: 'Client ToDelete', email: 'todel@example.com' });

  const invoiceData = {
    createdBy: admin._id,
    number: 1101,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'X', quantity: 1, price: 1, total: 1 }],
    currency: 'USD',
    total: 1,
  };

  const inv = await Invoice.create(invoiceData);

  // delete client
  await Client.deleteOne({ _id: client._id });

  // when populating, client should be null
  const found = await Invoice.findById(inv._id).populate('client').lean();
  expect(found).not.toBeNull();
  expect(found.client).toBeNull();
});

test('Invoice: validation should fail when required fields are missing', async () => {
  const Invoice = mongoose.model('Invoice');

  let threw = false;
  try {
    // missing required `number` and `client`
    await Invoice.create({ year: 2025, date: new Date(), expiredDate: new Date(), currency: 'USD' });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);
});
