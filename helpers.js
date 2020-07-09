
const getUserByEmail = function(email, database) {
  for (let obj in database) {
    if (database[obj].email === email) {
      return database[obj].id;
    } else {
      return false;
    }
  }
};

const newD = function() {
  let date = Date();
  let nDate = "";
  for (let i = 0; i < date.length - 29; i++) {
    nDate += date[i];
  }
  return nDate;
};

const generateRandomString = function() {
  for (let i = 0; i < 100; i++) {
    let string = Math.random().toString(36).slice(2);
    let strArr = string.split("").splice(5).join("");
    if (strArr.length === 6) {
      return strArr;
    }
  }
};

module.exports = { getUserByEmail, newD, generateRandomString };