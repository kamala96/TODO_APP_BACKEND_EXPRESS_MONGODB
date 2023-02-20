const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const auth = require("./auth");

// require database connection 
const dbConnect = require("./db/dbConnect");

// require the user model
const User = require("./db/userModel");

// require the todo model
const Todo = require("./db/todoModel");

// execute database connection 
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  // console.log(request.body);
  bcrypt.hash(request.body.password, 10).then((hashedPassword) => {
    // create a new user instance and collect the data
    const user = new User({
      fname: request.body.fname,
      lname: request.body.lname,
      email: request.body.email,
      password: hashedPassword,
    });

    // save the new user
    user.save().then((result) => {
      response.status(201).send({
        message: "User Created Successfully",
        result,
      });
    }).catch((error) => {
      response.status(500).send({
        message: "Error creating user",
        error,
      });
    });
  }).catch((e) => {
    // console.log(e)
    response.status(500).send({
      message: "Password was not hashed successfully",
      e,
    });
  });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          userinfo = {
            'id': user._id,
            'last_name': user.lname,
            'email': user.email
          }

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            user: userinfo,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

// get todos
app.get("/todos", auth, async (request, response) => {
  try {
    const todos = await Todo.find()
    response.status(200).json({ todos })
  } catch (error) {
    throw error
  }
});

// get todos by user
app.get("/my-todos/:id", async (request, response) => {
  try {
    const mongoose = require("mongoose");
    const param_id = mongoose.Types.ObjectId(request.params.id)
    // console.log(param_id)
    const todos = await Todo.find({ author: param_id })
    // console.log(todos)
    response.status(200).json({ todos })
  } catch (error) {
    // console.log(error)
    throw error
  }
});

// add-todo endpoint
app.post("/add-todo", (request, response) => {
  // console.log(request.body);
  // create a new user instance and collect the data
  const todo = new Todo({
    name: request.body.name,
    description: request.body.description,
    author: request.body.author,
    status: request.body.status,
  });

  // save the new todo
  todo.save().then(async () => {
    const todos = await Todo.find()
    response.status(201).send({
      message: "Todo added Successfully",
      todos,
    });
  }).catch((error) => {
    // console.log(error)
    response.status(500).send({
      message: "Error creating Todo",
      error,
    });
  });
});

// edit-todo endpoint
app.put("/edit-todo/:id", (request, response) => {
  // console.log(request.body);

  const {
    params: { id },
    body,
  } = request

  const updateTodo = Todo.findByIdAndUpdate(
    { _id: id },
    body.todo
  ).then(async (res) => {
    const todos = await Todo.find()
    response.status(201).send({
      message: "Todo updated Successfully",
      todos,
    });
  }).catch((error) => {
    response.status(500).send({
      message: "Error in updated Todo",
      error,
    });
  });
});

// delete-todo endpoint
app.post("/delete-todo/:id", (request, response) => {
  // console.log(request.body);
  const deletedTodo = Todo.findByIdAndRemove(request.params.id)
    .then(async () => {
      const todos = await Todo.find()
      response.status(201).send({
        message: "Todo deleted Successfully",
        todos,
      });
    }).catch((error) => {
      response.status(500).send({
        message: "Error while deleting Todo",
        error,
      });
    });

});


module.exports = app;
