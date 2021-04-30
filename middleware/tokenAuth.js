const JWT = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //Get Token
  const token = req.header("access-token");

  //Check for token;
  if (!token) {
    return res
      .status(401)
      .json({ msg: "No token was given, authorization is denied!" });
  }
  //Verify token;
  try {
    JWT.verify(token, config.get("tokenSecret"), (err, verifiedToken) => {
      if (err) {
        return res.status(401).json({ msg: "The given token is not Valid!" });
      } else {
        req.user = verifiedToken.user;
        next();
      }
    });
  } catch (err) {
    console.err("There is an error with Authenticating Token...");
    res
      .status(500)
      .json({
        msg: "There are some serverside issues with Authenticating Token...",
      });
  }
};
