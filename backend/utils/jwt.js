import jwt from "jsonwebtoken"; 

export const generateToken = (email) => {  // function used to generate json web token
  const token = jwt.sign(
    { email }, 
    process.env.JSON_SECRET, 
    { expiresIn: '1h' });
  return token;
};