// db/queries.js
const prisma = require("./prisma");

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email }
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: id }
  });
}

async function createUser(user) {
  return await prisma.user.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password
    }
  });
}

// add your project queries below

module.exports = {
  getUserByEmail,
  getUserById,
  createUser
};