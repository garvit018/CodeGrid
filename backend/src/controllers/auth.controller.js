import jwt from "jsonwebtoken";
import AccountVerification from "../model/AccountVerification.model.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/User.model.js";
import transporter from "../config/nodeMailer.js";
import bcrypt from "bcrypt";
import AccountRecover from "../model/AccountRecover.model.js";

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ login: false, message: "Missing username or password" });
  }
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.sendStatus(401);
  }
  const pass = await user.comparePassword(password);
  if (!pass) {
    return res.sendStatus(401);
  }
  const roles = Object.values(user.roles);
  const accessTokens = jwt.sign(
    {
      userInfo: {
        id: user._id,
        username: user.username,
        roles,
        email: user.email,
        fullName: user.fullName,
        problemSolved: user.problemSolved,
        isAccountVerified: user.isAccountVerified,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5h",
    }
  );

  const refreshToken = jwt.sign(
    {
      userInfo: {
        username: username,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: "None",
    // secure: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  });
  res.cookie("jwt_access", accessTokens, {
    httpOnly: true,
    secure: "None",
    // secure: true,
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });

  res.json({
    id: user._id,
    username: user.username,
    roles,
    accessTokens,
    email: user.email,
    fullName: user.fullName,
    problemSolved: user.problemSolved,
    isAccountVerified: user.isAccountVerified,
  });
};

const handleOAuthLogin = async (req, res) => {
  const { fullName, email, picture } = req.body;
  if (!email || !fullName || !picture) {
    return res
      .status(400)
      .json({ login: false, message: "Missing email, fullName or picture" });
  }
  let user = await User.findOne({ email: email });
  if (user) {
    user.fullName = fullName;
    user.picture = picture;
    await user.save();
  } else {
    const newUser = new User({
      username: email.split("@")[0],
      fullName: fullName,
      email: email,
      isAccountVerified: true,
      picture: picture,
      roles: { User: 2001 },
    });
    await newUser.save();
  }
  const roles = Object.values(user.roles);
  const accessTokens = jwt.sign(
    {
      userInfo: {
        id: user._id,
        username: user.username,
        roles,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        isAccountVerified: user.isAccountVerified,
        problemSolved: user.problemSolved,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5h",
    }
  );

  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: "None",
    // secure: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  });
  res.cookie("jwt_access", accessTokens, {
    httpOnly: true,
    secure: "None",
    // secure: true,
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });

  res.json({
    id: user._id,
    username: user.username,
    roles,
    accessTokens,
    email: user.email,
    fullName: user.fullName,
    picture: user.picture,
    isAccountVerified: user.isAccountVerified,
  });
};

export { handleLogin, handleOAuthLogin };
