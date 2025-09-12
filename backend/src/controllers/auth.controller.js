import jwt, { decode } from "jsonwebtoken";
import AccountVerification from "../model/AccountVerification.model.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/User.model.js";
import transporter from "../config/nodeMailer.js";
import bcrypt from "bcrypt";
import AccountRecover from "../model/AccountRecover.model.js";
import { User } from "../model/User.model.js";

const handleNewUser = async (req, res) => {
  const { username, password, email, fullName } = req.body;
  if (!username || !password || !email || !fullName) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const duplicateUsername = await User.findOne({ username: username });
  if (duplicateUsername) {
    return res
      .status(409)
      .json({ message: `Username ${username} already exists`, success: false });
  }
  const duplicateEmail = await User.findOne({ email: email });
  if (duplicateEmail) {
    return res
      .status(409)
      .json({ message: `Email ${email} already exists`, success: false });
  }
  try {
    const newUser = new User({
      username: username,
      password: password,
      email: email,
      fullName: fullName,
      isAccountVerified: false,
      roles: { User: 2001 },
      picture:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ",
      isOauth: false,
    });
    const saveUser = await newUser.save();
    const accountVerification = new AccountVerification({
      authcode: await bcrypt.hash(email, 12),
      email: email,
    });
    await accountVerification.save();
    transporter.sendMail(
      {
        from: "garvitgoyal83@gmail.com",
        to: email,
        subject: "Account Verification",
        html: `<h1>Click on the link below to verify your account</h1>
      <a href="${process.env.FRONTEND_URL}/auth/success?token=${accountVerification.authCode}">Verify Account</a>
      <br/>
      <p>Or copy and paste the following link in your browser</p>
      <p>${process.env.FRONTEND_URL}/auth/success?token=${accountVerification.authCode}</p>

      <p>Thank you for registering with us.</p>
      <i>Thanks & Regards,</i>
      <p>CodeGrid</p>
      `,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      }
    );
    res.status(201).json({
      message: `New Username ${username} created successfully`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

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

const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("jwt", {
      httpOnly: true,
      // secure: true,
      samesite: "None",
    });
    res.clearCookie("jwt_access", {
      httpOnly: true,
      // secure: true,
      samesite: "None",
    });
    return res.sendStatus(204);
  }
  user.refreshToken = "";
  await user.save();
  res.clearCookie("jwt", {
    httpOnly: true,
    // secure: true,
    samesite: "None",
  });
  res.clearCookie("jwt_access", {
    httpOnly: true,
    // secure: true,
    samesite: "None",
  });
  res.sendStatus(204);
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user.username !== decoded.username) return res.sendStatus(403);
    const roles = Object.values(user.roles);
    const accessToken = jwt.sign(
      {
        userInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "4h" }
    );
    res.json({ accessToken });
  });
};

const getUserData = async (req, res) => {
  const token = req?.cookies?.jwt_access;
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403);
    }
    res.status(200).json({
      user: decoded.userInfo,
      roles: decoded.userInfo.roles,
      accessToken: token,
      fullName: decoded.userInfo.fullName,
      email: decoded.userInfo.email,
      // id: decoded.userInfo.id,
      picture: decoded.userInfo.picture,
      isAccountVerified: decoded.userInfo.isAccountVerified,
      problemSolved: decoded.userInfo.problemSolved,
    });
  });
};

export {
  handleNewUser,
  handleLogin,
  handleOAuthLogin,
  handleAccountVerify,
  handleForgotPassword,
  handleAccountRecoveryTokenVerify,
  handleAccountRecovery,
  handleLogout,
  handleRefreshToken,
  getUserData,
};
