import { User } from "../../model/User.model.js";
import { Snippet } from "../../model/Snippet.model.js";
import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import verifyJWT from "../../middleware/verifyJWT.js";
import dotenv from "dotenv";

dotenv.config();

const longEnUSFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const useTimeString = (time) => {
  try {
    return longEnUSFormatter.format(new Date(time));
  } catch (error) {
    return time;
  }
};

router.get("/", async (req, res) => {
  const token = req.cookies.jwt_access;
  if (!token) {
    const allPublic = await Snippet.find({ snippetType: true });

    const uniqueResponseData = [
      ...new Map(allPublic.map((item) => [item["id"], item])).values(),
    ];
    res.send(
      [...uniqueResponseData].map((snippet) => {
        return {
          id: snippet.id,
          author: snippet.authorUserName,
          snippetTitle: snippet.snippetTitle,
          snippetCode: snippet.snippetCode,
          snippetLanguage: snippet.snippetLanguage,
          snippetType: snippet.snippetType ? "Public" : "Private",
          createdAt: useTimeString(snippet.createdAt),
        };
      })
    );
    // return res.sendStatus(401);
  } else {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const responseData = [];
    const selfUsername = user.userInfo.username;
    const snippetsOfUser = await Snippet.find({
      authorUserName: selfUsername,
    });
    snippetsOfUser.forEach((snippet) => {
      responseData.push(snippet);
    });

    const allPublic = await Snippet.find({ snippetType: true });

    allPublic.forEach((snippet) => {
      responseData.push(snippet);
    });
    const uniqueResponseData = [
      ...new Map(responseData.map((item) => [item["id"], item])).values(),
    ];
    // others + public
    const OthersNpublic = uniqueResponseData
      .filter((snippet) => snippet.authorUserName !== selfUsername)
      .filter((snippet) => snippet.snippetType === true);

    // self and all type
    const selfSnippets = uniqueResponseData.filter(
      (snippet) => snippet.authorUserName === selfUsername
    );

    res.send(
      [...OthersNpublic, ...selfSnippets].map((snippet) => {
        return {
          id: snippet.id,
          author: snippet.authorUserName,
          snippetTitle: snippet.snippetTitle,
          snippetCode: snippet.snippetCode,
          snippetLanguage: snippet.snippetLanguage,
          snippetType: snippet.snippetType ? "Public" : "Private",
          createdAt: useTimeString(snippet.createdAt),
        };
      })
    );
  }
});

router.get("/:snippetId", async (req, res) => {
  const { snippetId } = req.params;
  if (!snippetId) return res.sendStatus(400);
  const token = req?.cookies?.jwt_access;
  if (!token || token === "" || token === undefined) {
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) return res.sendStatus(404);
    if (snippet.snippetType === false) return res.sendStatus(403);
    res.send({
      id: snippet.id,
      author: snippet.authorUserName,
      snippetTitle: snippet.snippetTitle,
      snippetCode: snippet.snippetCode,
      snippetLanguage: snippet.snippetLanguage,
      snippetType: snippet.snippetType ? "Public" : "Private",
      createdAt: useTimeString(snippet.createdAt),
    });
  } else {
    // console.log(token)
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const selfUsername = user.userInfo.username;
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) return res.sendStatus(404);
    if (
      snippet.authorUserName !== selfUsername &&
      snippet.snippetType === false
    )
      return res.sendStatus(403);
    res.send({
      id: snippet.id,
      author: snippet.authorUserName,
      snippetTitle: snippet.snippetTitle,
      snippetCode: snippet.snippetCode,
      snippetLanguage: snippet.snippetLanguage,
      snippetType: snippet.snippetType ? "Public" : "Private",
      createdAt: useTimeString(snippet.createdAt),
    });
  }
});

router.use(verifyJWT);
router.post("/save-snippet", async (req, res) => {
  const {
    snippetTitle,
    snippetCode,
    snippetType = true,
    snippetLanguage,
  } = req.body;
  if (
    !snippetTitle ||
    !snippetCode ||
    snippetType === undefined ||
    !snippetLanguage
  ) {
    return res.status(400).send("Missing required fields");
  }

  const token = req.cookies.jwt_access;
  const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  // console.log(user.userInfo.username);
  const username = user.userInfo.username;
  const author = await User.findOne({ username });
  if (!author) {
    return res.status(400).send("User not found");
  }
  const newSnippet = new Snippet({
    authorUserName: username,
    authorId: author._id,
    snippetTitle,
    snippetCode,
    snippetType: snippetType === "public" ? true : false,
    snippetLanguage,
  });
  const savedSnippet = await newSnippet.save();
  res.send(`/snippets/${savedSnippet._id}`);
});

export default router;
