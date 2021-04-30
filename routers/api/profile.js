const router = require("express").Router();
const auth = require("../../middleware/tokenAuth");
const { body, validationResult } = require("express-validator");
const Profile = require("../../models/profileModel");
const Emoji = require("../../models/emojiModel");
const User = require("../../models/userModel");

//@Route   === GET api/profile/me;
//@Access  === Private;
//@Desc    === Get my profile;
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "No prfiles were found!" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "There is a server side error on Profile!" });
  }
});

//@Route   === Post api/profile/;
//@Access  === Private;
//@Desc    === Create & update profiles;
router.post(
  "/",
  [
    auth,
    [
      body("status", "Status is a required feild!").not().isEmpty(),
      body("skills", "Skills is a required feild!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      website,
      location,
      status,
      skills,
      bio,
      youtube,
      facebook,
      instagram,
      twitter,
      github,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    if (github) profileFields.social.github = github;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ msg: "There is a server side error with Profile!" });
    }
  }
);

//@Route   === Get api/profiles/;
//@Access  === Public;
//@Desc    === Get all profiles;
router.get("/profiles", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", [
      "name",
      "avatar",
      "email",
    ]);
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "There is a server side error with Profile" });
  }
});

//@Route   === Get api/profile/user/:user_id;
//@Access  === Private;
//@Desc    === Get user profile by ID;
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar", "email"]);
    if (!profile) {
      return res.status(400).json({ msg: "No profiles were found!" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No profiles were found!" });
    }
    res.status(500).json({ msg: "There is a server side error with Profile!" });
  }
});
//@Route   === Delete api/profile;;
//@Access  === Private;
//@Desc    === Deletes profile, emojis, and user!;

router.delete("/", auth, async (req, res) => {
  try {
    await Emoji.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User was successfully removed!" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No users were found!" });
    }
    res.status(500).json({ msg: "There is a server side error with Profile!" });
  }
});

//@Route   === PUT api/profile/experience;
//@Access  === Private;
//@Desc    === Put/ add Experiences for a user!;
router.put(
  "/experience",
  [
    auth,
    [
      body("title", "Title is a required field!").not().isEmpty(),
      body("company", "Company is a required field!").not().isEmpty(),
      body("fromDate", "From Data is a required field!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      fromDate,
      toDate,
      currentDate,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      fromDate,
      toDate,
      currentDate,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ msg: "There is a server side error with Profile!" });
    }
  }
);

//@Route   === PUT api/profile/education;
//@Access  === Private;
//@Desc    === Put/ add Education for a user!;
router.put(
  "/education",
  [
    auth,
    [
      body("school", "School is a required field!").not().isEmpty(),
      body("degree", "Degree is a required field!").not().isEmpty(),
      body("fieldOfStudy", "Fields Of Study is a required field!")
        .not()
        .isEmpty(),
      body("fromDate", "From Date is a required field!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldOfStudy,
      fromDate,
      toDate,
      currentDate,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      fromDate,
      toDate,
      currentDate,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ msg: "There is a server side error with Profile!" });
    }
  }
);

//@Route   === DELETE api/profile/experience/:exp_id;
//@Access  === Private;
//@Desc    === Delete an experience for a user!;

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeExp = profile.experience
      .map((exps) => exps.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeExp, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Experiences were found!" });
    }
    res.status(500).json({ msg: "There is a server side error with Profile!" });
  }
});

//@Route   === DELETE api/profile/education/:edu_id;
//@Access  === Private;
//@Desc    === Delete an education for a user!;
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeEdu = profile.education
      .map((edu) => edu.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeEdu, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Educations were found!" });
    }
    res.status(500).json({ msg: "There is a server side error with Profile!" });
  }
});
module.exports = router;
