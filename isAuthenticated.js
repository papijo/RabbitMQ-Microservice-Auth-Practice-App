const jwt = require("jsonwebtoken");

// export async function isAuthenticated(req, res, next) => {
//     //"Bearer <token>".split(" ")[1]
//     const token = req.headers["authorization"].split(" ")[1]

//     jwt.verify(token, "secretstring", (error, user) => {
//         if(error) console.log(error)
//         else{
//             req.user = user
//             next()
//         }
//     })
// }

const isAuthenticated = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  jwt.verify(token, "secret", (error, user) => {
    if (error) console.log(error);
    else {
      req.user = user;
      next();
    }
  });
};

module.exports = isAuthenticated;
