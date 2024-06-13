const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(404).json({'message':'error logging in'});
  }
  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({data:password},'access',{'expiresIn':60*60})
    req.session.authorization={
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  }else{
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
   const book = books[isbn];
  if(book){
    const reviews = book.reviews;
    if(reviews[username]){
    reviews[username]=req.body.review;
    return res.status(200).json({message:'review updated'})
    }else{
         reviews[username]=req.body.review;
        return res.status(201).json({message:'review added'})
    }
  }
  return res.status(404).json({'message':'book not existed'})
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
     const username = req.session.authorization.username;
  const isbn = req.params.isbn;
   const book = books[isbn];
  if(book){
    const reviews = book.reviews;
    if(reviews[username]){
   delete reviews[username];
    return res.status(200).json({message:'review deleted'})
    }else{
        return res.status(404).json({message:'review not existed'})
    }
  }
  return res.status(404).json({'message':'book not existed'})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
