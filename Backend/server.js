const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "rvgb[2uoajdlkbveyifsdvbj9uweoj";

require("./Schema/users");
server.use(express.json());
server.use(cors());

//connecting the databse
const mongoURL =
  "mongodb+srv://sakshikulkarni880:dPQQpISegisutgkW@cluster0.ia4rxr6.mongodb.net/?retryWrites=true&w=majority";

//checking databse connection
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to db!");
  })
  .catch((e) => console.log(e));

const port = process.env.PORT || 5000;

const User = mongoose.model("UserDetails");

//SignUp API
server.post("/register", async (req, res) => {
  const { fname, mname, lname, gender, email, contact, address, password } =
    req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const userMailExists = await User.findOne({ email });
    const userContactExists = await User.findOne({ contact });

    if (userMailExists) {
      return res.send({ error: "User Email already exists!" });
    } else if (userContactExists) {
      return res.send({ error: "User Contact already exists!" });
    }
    await User.create({
      fname,
      mname,
      lname,
      gender,
      email,
      contact,
      address,
      password: encryptedPassword,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "Error Found", error });
  }
});

//Signin or login API
server.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET);

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});

//User Data
server.post("/user-data", async (req, res) => {
  const { token } = req.body;
  try {
    const loggedUser = jwt.verify(token, JWT_SECRET);
    const userEmail = loggedUser.email;
    User.findOne({ email: userEmail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: data });
      });
  } catch (error) {}
});

//fetching all the user's data and saving it in table
server.get("/getAllUser", async (req, res) => {
  try {
    const { query } = req.query;
    let allUser;

    if (query) {
      // If a search query is provided, filter the user data based on the query
      allUser = await User.find({ fname: { $regex: query, $options: "i" } });
    } else {
      // If no search query is provided, retrieve all users
      allUser = await User.find({});
    }

    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: "Internal Server Error" });
  }
});

//Paginated users
server.get("/paginatedUsers", async (req, res) => {
  const allUser = await User.find({});
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const lastIndex = page * limit;

  const results = {};
  results.totalUser = allUser.length;
  results.pageCount = Math.ceil(allUser.length / limit);

  if (lastIndex < allUser.length) {
    results.next = {
      page: page + 1,
    };
  }
  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
    };
  }
  results.result = allUser.slice(startIndex, lastIndex);
  res.json(results);
});

server.listen(port, () => {
  console.log("Server is started!");
});

// dPQQpISegisutgkW;
