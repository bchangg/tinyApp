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

const emailExists= function findIfUserIsInDatabase(email, database) {
  for(let user in database) {
    if(database[user].email === email) {
      return true;
    }
  }
  return false;
}


// TESTING
// const db = {
//   user1: {
//     id: "bob",
//     email: "bob@bob.com",
//     password: "12345"
//   },
//   user2: {
//     id: "alice",
//     email: "alice@alice.com",
//     password: "12345"
//   }
// }
// 
// const db2 = {};
// 
// console.log(emailExists("bob@bob.com", db));
// console.log(emailExists("alice@alice.com", db));
// console.log(emailExists("bob@bob.com", db2));

module.exports = {
  random6CharString,
  emailExists
};