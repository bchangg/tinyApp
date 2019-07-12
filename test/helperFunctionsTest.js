const { assert } = require("chai");
const { findUser } = require("../database/helperFunctions");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUser', function() {
  it('should return a user with valid email', function() {
    const user = findUser("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return false with an invalid email', function() {
    const user = findUser("asdklfjlkjasd@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  })
});