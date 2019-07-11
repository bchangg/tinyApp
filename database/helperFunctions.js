// Sampled from:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const randomString = function(length) {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const findUser = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return false;
};

module.exports = {
  randomString,
  findUser
};