const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
  },
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      fromDate: {
        type: Date,
        required: true,
      },
      toDate: {
        type: Date,
      },
      currentDate: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldOfStudy: {
        type: String,
        required: true,
      },
      fromDate: {
        type: Date,
        required: true,
      },
      toDate: {
        type: Date,
      },
      currentDate: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  social: {
    facebook: {
      type: String,
    },
    youtube: {
      type: String,
    },
    github: {
      type: String,
    },
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
  },
});

module.exports = mongoose.model("Profile", profileSchema);
