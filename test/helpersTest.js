const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.isTrue(user === expectedOutput)
  });
  
  it('should return false if email not in database', () => {
    const user = getUserByEmail("ie@example.com", users)

    assert.isFalse(user);
  });
});