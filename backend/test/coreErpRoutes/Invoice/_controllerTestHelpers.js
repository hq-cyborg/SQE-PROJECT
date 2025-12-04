const mongoose = require('mongoose');

function makeModelStub(saveResult = null, findOneResult = null, findOneAndUpdateResult = null, countResult = 0, findResults = []) {
  // Constructor for new Model()
  function Model(data) {
    this._doc = data;
    this.save = jest.fn().mockResolvedValue(saveResult || { _id: 'generatedId', ...data });
  }

  Model.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(findOneResult),
  });
  Model.findOneAndUpdate = jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(findOneAndUpdateResult),
  }));
  Model.find = jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(findResults),
  });
  Model.countDocuments = jest.fn().mockResolvedValue(countResult);

  return Model;
}

function spyMongooseModel(map) {
  jest.spyOn(mongoose, 'model').mockImplementation((name) => {
    return map[name] || makeModelStub();
  });
}

module.exports = { makeModelStub, spyMongooseModel };
