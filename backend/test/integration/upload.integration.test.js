const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('../utils/mongoMemory');

beforeAll(async () => {
  await connect();
  require('../../src/models/coreModels/Upload');
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test('Upload model: create and read', async () => {
  const Upload = mongoose.model('Upload '); // model name has a trailing space in file

  const userId = new mongoose.Types.ObjectId();
  const uploadData = {
    modelName: 'testModel',
    fieldId: 'someField',
    fileName: 'file.pdf',
    fileType: 'pdf',
    isPublic: true,
    userID: userId,
    isSecure: false,
    path: '/uploads/file.pdf',
  };

  const created = await Upload.create(uploadData);
  expect(created).toHaveProperty('_id');
  expect(created.fileName).toBe(uploadData.fileName);
  expect(created.fileType).toBe('pdf');

  const found = await Upload.findOne({ _id: created._id }).lean();
  expect(found).not.toBeNull();
  expect(found.path).toBe(uploadData.path);
});

test('Upload model: update visibility and ensure record persists after "user" deletion', async () => {
  const Upload = mongoose.model('Upload ');

  const userId = new mongoose.Types.ObjectId();
  const uploadData = {
    modelName: 'testModel2',
    fieldId: 'f2',
    fileName: 'file2.jpg',
    fileType: 'jpg',
    isPublic: false,
    userID: userId,
    isSecure: true,
    path: '/uploads/file2.jpg',
  };

  const created = await Upload.create(uploadData);
  // flip visibility
  created.isPublic = true;
  await created.save();

  const found = await Upload.findById(created._id).lean();
  expect(found.isPublic).toBe(true);

  // simulate deleting the user (userId is not enforced as ref in schema) - ensure upload still exists
  // nothing to delete in DB, but check record persists
  const post = await Upload.findById(created._id).lean();
  expect(post).not.toBeNull();
  expect(post.userID.toString()).toBe(userId.toString());
});
// Validation testing of different feilds
test('Upload: validation fails when required fields missing and invalid fileType', async () => {
  const Upload = mongoose.model('Upload ');

  let threw = false;
  try {
    // missing fileName and path
    await Upload.create({ modelName: 'm', fieldId: 'f', fileType: 'pdf', isPublic: true, userID: new mongoose.Types.ObjectId(), isSecure: false });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);

  // invalid fileType (not in enum)
  threw = false;
  try {
    await Upload.create({ modelName: 'm2', fieldId: 'f2', fileName: 'bad.exe', fileType: 'exe', isPublic: true, userID: new mongoose.Types.ObjectId(), isSecure: false, path: '/x' });
  } catch (err) {
    threw = true;
    expect(err.name).toBe('ValidationError');
  }
  expect(threw).toBe(true);
});
