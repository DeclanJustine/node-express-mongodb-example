const usersRepository = require('./users-repository');
const { hashPassword } = require('../../../utils/password');
const { passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

async function changePassword(id, oldPassword, newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    throw new Error("New password doesn't match with the password");
  }

  if (newPassword.length < 6 || newPassword.length > 32) {
    throw new Error('New password must be between 6 and 32 characters');
  }

  const user = await usersRepository.getUser(id);

  const passwordValid = await passwordMatched(oldPassword, user.password);
  if (!passwordValid) {
    throw new Error("Old password doesn't match current password");
  }

  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password
  await usersRepository.updatePassword(id, hashedPassword);
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

async function userCheckEmail(email) {
  const checkEmail = await usersRepository.getUserEmail(email);

  if (!checkEmail) {
    return true;
  } else {
    return false;
  }
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  userCheckEmail,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
};
