// Sampled from:
// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const random6CharString = function generateRandomString() {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
}

const emailExistsLookup = function findIfUserIsInDatabase(email, database) {
  for(let user in database) {
    if(database[user].email === email) {
      return true;
    }
  }
  return false;
}


module.exports = {
  random6CharString,
  emailExistsLookup
};