const express = require("express");
const app = express();
const PORT = 7070;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");
app.use(express.json());

mongoose.connect(
  "mongodb://localhost/auth-service",
  { useNewUrlParser: true },
  () => {
    console.log(`Auth-Service DB Connected`);
  }
);

//Register
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.json({ message: "User Already Exists" });
  } else {
    const newUser = new User({
      name,
      email,
      password,
    });
    newUser.save();
    return res.json(newUser);
  }
});

//Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.json({ message: "User does not exist" });
  } else {
    //Check if entered password is right or wrong
    if (password !== user.password) {
      return res.json({ message: "Password Incorrect" });
    }
    const payload = {
      email,
      name: user.name,
    };
    jwt.sign(payload, "secret", (error, token) => {
      if (error) console.log(error);
      else {
        return res.json({ token: token });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Auth-Service Microservice is running at PORT: ${PORT}`);
});
