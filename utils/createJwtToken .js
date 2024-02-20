const jwt = require("jsonwebtoken");

const createJwtToken = (user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      // firstName: user.firstName,
      // lastName: user.lastName,
      // email: user.email,
      // role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  console.log("🚀 ~ loginUser: ~ accessToken:", accessToken);

  return {
    accessToken: accessToken,
  };
};

module.exports = createJwtToken;
