import { logEvents } from "./loggingEvents.js";

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}`, "errorLog.txt");
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
};

export default errorHandler;
