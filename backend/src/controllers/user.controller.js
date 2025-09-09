import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const getUserData = (req, res, next) => {
  const token = req?.cookies?.jwt_access;
  // console.log(token);
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    res.status(200).json({
      username: decoded.userInfo.username,
      email: decoded.userInfo.email,
      roles: decoded.userInfo.roles,
      fullName: decoded.userInfo.fullName,
      picture: decoded.userInfo.picture,
      isAccountVerified: decoded.userInfo.isAccountVerified,
      problemSolved: decoded.userInfo.problemSolved,
    });
  });
};

export default getUserData;