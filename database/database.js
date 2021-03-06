const mongoose = require("mongoose");
const config = require("config");
const uri = config.get("MONGOOSEURI");

const connection = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Successfully connnected to Mongo Database");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connection;
