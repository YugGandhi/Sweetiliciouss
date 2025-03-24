const bcrypt = require("bcryptjs");

const hashPassword = async () => {
  const plainTextPassword = "admin123"; // Change if needed
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  console.log("Hashed Password:", hashedPassword);
};

hashPassword();
