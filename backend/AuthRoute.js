const { SignupAuth, LoginAuth, LogoutAuth } = require("./AuthController");
const { verifyUser } = require("./AuthMiddleware");
const router = require("express").Router();

// Verify token endpoint
router.get("/verify", verifyUser);

// Signup and Login
router.post("/signup", SignupAuth);
router.post("/login", LoginAuth);

// Logout
 router.post("/logout", LogoutAuth);



// Root endpoint
router.get("/", (req, res) => {
  res.send("API is running 🎉");
});

module.exports = router;
