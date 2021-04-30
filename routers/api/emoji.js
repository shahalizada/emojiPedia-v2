const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/tokenAuth");
const User = require("../../models/userModel");
const Emoji = require("../../models/emojiModel");

//@Route   === POST api/emoji;
//@Access  === Private;
//@Desc    === Add new emoji Posts;
router.post(
  "/",
  [
    auth,
    [
      body("emoji", "Emoji is a required field!").not().isEmpty(),
      body("title", "Post Title is a required field!").not().isEmpty(),
      body("description", "Post Description is a required field!")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { emoji, title, description } = req.body;
    try {
      //Find the user;
      const user = await User.findById(req.user.id).select("-password");
      //Create a new emojies;
      const newEmoji = new Emoji({
        emoji: emoji,
        title: title,
        description: description,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      //Save & return Emojies;
      const savedEmoji = await newEmoji.save();
      res.json(savedEmoji);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "There is server side error with Emojies!" });
    }
  }
);

//@Route   === GET api/emoji;
//@Access  === Public;
//@Desc    === Get all emoji Posts;
router.get("/", async (req, res) => {
  try {
    const emojies = await Emoji.find()
      .populate("users", ["name", "email", "avatar"])
      .sort({ date: -1 });
    res.json(emojies);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === GET api/emoji;
//@Access  === Private;
//@Desc    === Get all emoji Posts;
router.get("/emojies", auth, async (req, res) => {
  try {
    const allEmojies = await Emoji.find().sort({ date: -1 });
    res.json(allEmojies);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === GET api/emoji/:id;
//@Access  === Private;
//@Desc    === Get an emoji Posts by its ID;
router.get("/:id", auth, async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);
    if (!emoji) {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    res.json(emoji);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === DELETE api/emoji/:id;
//@Access  === Private;
//@Desc    === Delete an emoji Posts by its ID;
router.delete("/:id", auth, async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);
    if (!emoji) {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    if (emoji.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "You are not authorized to delete this post!" });
    }
    await emoji.remove();
    res.json({ msg: "Emoji Post was successfully deleted!" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === PUT api/emoji/like/:id;
//@Access  === Private;
//@Desc    === Add likes to an emoji Posts by its ID;
router.put("/like/:id", auth, async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);
    if (
      emoji.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res
        .status(400)
        .json({ msg: "You have already liked this Emoji!" });
    }
    emoji.likes.unshift({ user: req.user.id });
    await emoji.save();

    res.json(emoji.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === PUT api/emoji/unlike/:id;
//@Access  === Private;
//@Desc    === Remove likes from an emoji Posts by its ID;
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);

    if (
      emoji.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "You haven't liked this Emoji yet!" });
    }

    const removeIndex = emoji.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    emoji.likes.splice(removeIndex);

    await emoji.save();

    res.json(emoji.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Emojis were found!" });
    }
    res.status(500).json({ msg: "There is server side error with Emojies!" });
  }
});

//@Route   === Post api/emoji/comment/:id;
//@Access  === Private;
//@Desc    === Add comments to an emoji Posts by its ID;

router.post(
  "/comment/:id",
  [auth, [body("text", "Comment Text is a required field!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      let emoji = await Emoji.findById(req.params.id);

      const newComment = {
        comment: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      emoji.comments.unshift(newComment);
      await emoji.save();
      res.json(emoji.comments);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(400).json({ msg: "No Emojis were found" });
      }
      res
        .status(500)
        .json({ msg: "There is a server side error in emojis file!" });
    }
  }
);

//@Route   === Delete api/emoji/comment/:id;
//@Access  === Private;
//@Desc    === Delete comments from an emoji Posts by its ID;
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const emoji = await Emoji.findById(req.params.id);

    //Pull out the comment
    const comment = emoji.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(400).json({ msg: "No commnets were found!" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "You are not authorized to delete this comment!" });
    }

    emoji.comments = emoji.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await emoji.save();

    return res.json(emoji.comments);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No Emojis were found" });
    }
    res
      .status(500)
      .json({ msg: "There is a server side error in emojis file!" });
  }
});

module.exports = router;
