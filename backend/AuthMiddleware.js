const jwt = require("jsonwebtoken");
const User = require("./model/UserModel");

const verifyUser = async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ status: false });

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not defined");
      return res.json({ status: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.json({ status: false });

    return res.json({ status: true, user });
  } catch (err) {
    console.error("verifyUser error:", err.message);
    return res.json({ status: false });
  }
};

module.exports = { verifyUser };
