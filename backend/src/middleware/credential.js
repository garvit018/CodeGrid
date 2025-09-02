import allowedUrl from "./config/allowedUrl.js";

const credential = (req, res, next) => {
  const origin = req.headers.origin;
  try {
    if (allowedUrl.includes(origin)) {
      res.header("Access-Control-Allow-Credentials", true);
    }
  } catch (error) {
    console.log(error);
  }
  next();
};

export default credential;
