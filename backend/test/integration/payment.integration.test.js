const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('../utils/mongoMemory');

beforeAll(async () => {
  await connect();
  require('../../src/models/coreModels/Admin');
  require('../../src/models/appModels/Client');
  require('../../src/models/appModels/Invoice');
  require('../../src/models/appModels/PaymentMode');
  require('../../src/models/appModels/Payment');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test('Payment:Create payment and link to invoice/client/admin', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'pay-admin@example.com', name: 'Pay', enabled: true });
  const client = await Client.create({ name: 'Client B', email: 'clientb@example.com' });
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 2001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'Service', quantity: 1, price: 100, total: 100 }],
    currency: 'USD',
    total: 100,
  });

  const pm = await PaymentMode.create({ name: 'Cash', description: 'Cash payment' });

  const paymentData = {
    createdBy: admin._id,
    number: 1,
    client: client._id,
    invoice: invoice._id,
    date: new Date(),
    amount: 100,
    currency: 'USD',
    paymentMode: pm._id,
  };

  const payment = await Payment.create(paymentData);
  expect(payment).toHaveProperty('_id');
  expect(payment.amount).toBe(100);

  const found = await Payment.findOne({ _id: payment._id }).populate('client createdBy paymentMode invoice').lean();
  expect(found).not.toBeNull();
  expect(found.client.name).toBe('Client B');
  expect(found.invoice.number).toBe(2001);
  expect(found.paymentMode.name).toBe('Cash');
});

test('Payment: create payment, delete client, then read payment (client populated should be null)', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'pay2-admin@example.com', name: 'Pay2', enabled: true });
  const client = await Client.create({ name: 'Client C', email: 'cc@example.com' });
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 3001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'Svc', quantity: 1, price: 40, total: 40 }],
    currency: 'USD',
    total: 40,
  });

  const pm = await PaymentMode.create({ name: 'Wire', description: 'Wire transfer' });

  const payment = await Payment.create({
    createdBy: admin._id,
    number: 3,
    client: client._id,
    invoice: invoice._id,
    date: new Date(),
    amount: 40,
    currency: 'USD',
    paymentMode: pm._id,
  });

  // delete client
  await Client.deleteOne({ _id: client._id });

  const found = await Payment.findById(payment._id).populate('client').lean();
  expect(found).not.toBeNull();
  // since client was deleted, populated client should be null
  expect(found.client).toBeNull();
  // payment record should still exist and amount preserved
  expect(found.amount).toBe(40);
});

test('Payment: delete invoice and ensure payment still references the invoice id (populate null)', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'pay3-admin@example.com', name: 'Pay3', enabled: true });
  const client = await Client.create({ name: 'Client D' });
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 4001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'Svc2', quantity: 1, price: 60, total: 60 }],
    currency: 'USD',
    total: 60,
  });

  const pm = await PaymentMode.create({ name: 'Check', description: 'Check' });

  const payment = await Payment.create({
    createdBy: admin._id,
    number: 4,
    client: client._id,
    invoice: invoice._id,
    date: new Date(),
    amount: 60,
    currency: 'USD',
    paymentMode: pm._id,
  });

  // delete invoice
  await Invoice.deleteOne({ _id: invoice._id });

  const found = await Payment.findById(payment._id).populate('invoice').lean();
  expect(found).not.toBeNull();
  expect(found.invoice).toBeNull();
  expect(found.amount).toBe(60);
});

test('Payment: update amount and verify persisted change', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'pay4-admin@example.com', name: 'Pay4', enabled: true });
  const client = await Client.create({ name: 'Client E' });
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 5001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'SvcX', quantity: 1, price: 20, total: 20 }],
    currency: 'USD',
    total: 20,
  });

  const pm = await PaymentMode.create({ name: 'Mobile', description: 'Mobile pay' });

  const payment = await Payment.create({
    createdBy: admin._id,
    number: 5,
    client: client._id,
    invoice: invoice._id,
    date: new Date(),
    amount: 20,
    currency: 'USD',
    paymentMode: pm._id,
  });

  // update via findOneAndUpdate
  await Payment.findOneAndUpdate({ _id: payment._id }, { $set: { amount: 25 } }, { new: true }).exec();

  const found = await Payment.findById(payment._id).lean();
  expect(found.amount).toBe(25);
});

test('Payment: validation fails when required fields are missing (client)', async () => {
  const Admin = mongoose.model('Admin');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'payval-admin@example.com', name: 'PayVal', enabled: true });
  const client = await (await mongoose.model('Client'))?.create ? await mongoose.model('Client').create({ name: 'Client V' }) : null;
  // create invoice with client to satisfy invoice requirements
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 6001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client ? client._id : new mongoose.Types.ObjectId(),
    items: [{ itemName: 'SvcV', quantity: 1, price: 10, total: 10 }],
    currency: 'USD',
    total: 10,
  });

  const pm = await PaymentMode.create({ name: 'Test', description: 'Test' });

  let threw = false;
  try {
    // omit client field (required)
    await Payment.create({ createdBy: admin._id, number: 99, invoice: invoice._id, date: new Date(), amount: 10, currency: 'USD', paymentMode: pm._id });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);
});

test('Payment: validation fails when amount is missing', async () => {
  const Admin = mongoose.model('Admin');
  const Client = mongoose.model('Client');
  const Invoice = mongoose.model('Invoice');
  const PaymentMode = mongoose.model('PaymentMode');
  const Payment = mongoose.model('Payment');

  const admin = await Admin.create({ email: 'payval2-admin@example.com', name: 'PayVal2', enabled: true });
  const client = await Client.create({ name: 'Client V2' });
  const invoice = await Invoice.create({
    createdBy: admin._id,
    number: 7001,
    year: 2025,
    date: new Date(),
    expiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    client: client._id,
    items: [{ itemName: 'SvcV2', quantity: 1, price: 15, total: 15 }],
    currency: 'USD',
    total: 15,
  });

  const pm = await PaymentMode.create({ name: 'Test2', description: 'Test2' });

  let threw = false;
  try {
    // omit amount
    await Payment.create({ createdBy: admin._id, number: 100, client: client._id, invoice: invoice._id, date: new Date(), currency: 'USD', paymentMode: pm._id });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);
});
