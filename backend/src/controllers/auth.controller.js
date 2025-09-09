import jwt from "jsonwebtoken";
import AccountVerification from "../model/AccountVerification.model.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/User.model.js";
import transporter from "../config/nodeMailer.js";
import bcrypt from "bcrypt";
import AccountRecover from "../model/AccountRecover.model.js";
import { use } from "react";

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
        username: user.username,
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

  const refreshToken = jwt.sign(
    {
      userInfo: {
        username: user.username,
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
    picture: user.picture,
    isAccountVerified: user.isAccountVerified,
  });
};

const handleAccountVerify = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ login: false, message: "Missing token" });
  }
  const pendingAccount = await AccountVerification.findOne({ authcode: token });
  if (!pendingAccount) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await User.findOne({ email: pendingAccount.email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.isAccountVerified = true;
  await user.save();
  await pendingAccount.deleteOne();
  transporter.sendMail(
    {
      from: '"garvitgoyal83@gmail.com"',
      to: pendingAccount.email,
      subject: "Account Verification Successful - CodeGrid",
      html: `<h1>Thanks for registering with CodeGrid.</h1>
    <br/>
    <p>Hi ${pendingAccount.fullName},</p>
    <p>Your account has been successfully verified.</p>
    <p>You can now log in to your account and start using our services - CodeGrid Team.</p>
    <br/>
    <p>Happy Coding!!</p>
    <br/>
    <i>Thanks & Regards,</i>
    <p>CodeGrid</p>`,
    },
    (err, info) => {
      if (err) {
        console.log("Error sending email:", err);
      } else {
        console.log("Email sent successfully:", info);
      }
    }
  );
  res.status(200).json({ message: "Account verified successfully" });
};

const handleForgotPassword = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Missing username" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res
      .status(400)
      .json({ message: "No Account is associated with this username" });
  }
  const newAccountRecover = new AccountRecover({
    authcode: await bcrypt.hash(user.email, 12),
    email: user.email,
  });
  await newAccountRecover.save();
  transporter.sendMail(
    {
      from: '"garvitgoyal83@gmail.com',
      to: user.email,
      subject: "Account Recovery - CodeGrid" + username,
      html: `<h1>Click on the Link below to recover your account</h1>
    <p>Hi ${user.username},</p>
    <p>You requested a Account recovery. Please use the following link to reset your password:</p>
    <a href="${process.env.FRONTEND_URL}/auth/recover?token=${newAccountRecover.authcode}">Recover Account</a>
    <br/>
    <p>Or copy and paste the following link in your browser</p>
    <br/>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>Thanks & Regards,</p>
    <p>CodeGrid</p>`,
    },
    (err, info) => {
      if (err) {
        console.log("Error sending email:", err);
      } else {
        console.log("Email sent successfully:", info);
      }
    }
  );
  res
    .status(200)
    .json({ success: true, message: "Password recovery email sent" });
};

const handleAccountRecoveryTokenVerify = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ login: false, message: "Missing token" });
  }
  const pendingAccount = await AccountRecover.findOne({ authcode: token });
  if (!pendingAccount) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  return res.status(200).json({ message: "Valid token" });
};

const handleAccountRecovery = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ login: false, message: "Missing token" });
  }
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Missing newPassword or confirmPassword" });
  }
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "newPassword and confirmPassword do not match" });
  }
  const pendingAccount = await AccountRecover.findOne({ authcode: token });
  if (!pendingAccount) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  const user = await User.findOne({ email: pendingAccount.email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  user.password = newPassword;
  await user.save();
  await pendingAccount.deleteOne();
  res.status(200).json({ message: "Password reset successfully" });
};

export {
  handleLogin,
  handleOAuthLogin,
  handleAccountVerify,
  handleForgotPassword,
  handleAccountRecoveryTokenVerify,
  handleAccountRecovery,
};
