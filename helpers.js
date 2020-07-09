
const getUserByEmail = function(email, database) {
  for (let obj in database) {
    if (database[obj].email === email) {
      return database[obj].id;
    } else {
      return false;
    }
  }
};

module.exports = { getUserByEmail: getUserByEmail };