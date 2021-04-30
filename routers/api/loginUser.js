const router = require("express").Router();
const config = require("config");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/tokenAuth");
const User = require("../../models/userModel");

//@Route   === GET api/login;
//@Access  === Private;
//@Desc    === Get Authenticated Users;
router.get("/", auth, async (req, res) => {
  try {
    const authUser = await User.findById(req.user.id).select("-password");
    res.json(authUser);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ msg: "There is a Server side error with loginUser!" });
  }
});

//@Route   === POST api/login;
//@Access  === Public;
//@Desc    === Login or Authenticating Users;
router.post(
  "/",
  [
    body("email", "Email is a required field!").isEmail(),
    body("password", "Password is a required field!").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //Find if the user exists;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid email or password!" }] });
      }
      //Match the password;
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid email or password!" }] });
      }
      //Assign Jwt & Return the User cre;
      const payload = {
        user: {
          id: user.id,
        },
      };
      Jwt.sign(
        payload,
        config.get("tokenSecret"),
        { expiresIn: "5 day" },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              avatar: user.avatar,
              date: user.date,
            },
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ msg: "There is a server side error with loginUser!" });
    }
  }
);

module.exports = router;
