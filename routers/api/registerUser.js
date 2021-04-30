const router = require("express").Router();
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const JWT = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/userModel");
const { body, validationResult } = require("express-validator");
const normalize = require("normalize-url");

//@Route === POST api/register;
//@Access === Public;
//@Desc === Register users;
router.post(
  "/",
  [
    [
      body("name", "Name is a required field!").not().isEmpty(),
      body("email", "Email is a required field!").isEmail(),
      body(
        "password",
        "Password is a required field, with minimun 8 characters!"
      ).isLength({ min: 8 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      //CHECK FOR EXISTING USERS.
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          errors: [
            { msg: "This email is already being used with another acccount!" },
          ],
        });
      }

      //GET AVATAR;
      const avatar = normalize(
        gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        }),
        { forceHttps: true }
      );

      //SAVE NEW USER TO THE DATABASE;
      user = new User({
        name,
        email,
        password,
        avatar,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //RETURN JSONWEBTOKEN;
      const payload = {
        user: {
          id: user.id,
        },
      };

      JWT.sign(
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
              avatar: user.avatar,
              password: user.password,
            },
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .send("There is a server side error with Registering user file");
    }
  }
);

module.exports = router;
