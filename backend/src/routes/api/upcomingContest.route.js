import express from "express";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

const durationInSec = (durationInSeconds) => {
  durationInSeconds = parseInt(durationInSeconds);
  const durationInMinutes = durationInSeconds / 60;
  const durationInHours = durationInMinutes / 60;
  const durationInDays = durationInHours / 24;
  const durationInWeeks = durationInDays / 7;
  const durationInMonths = durationInWeeks / 4;
  const durationInYears = durationInMonths / 12;
  if (durationInYears > 1) {
    return `${Math.floor(durationInYears)} years`;
  } else if (durationInMonths > 1) {
    return `${Math.floor(durationInMonths)} months`;
  } else if (durationInWeeks > 1) {
    return `${Math.floor(durationInWeeks)} weeks`;
  } else if (durationInDays > 1) {
    return `${Math.floor(durationInDays)} days`;
  } else if (durationInHours > 1) {
    return `${Math.floor(durationInHours)} hours`;
  } else if (durationInMinutes > 1) {
    return `${Math.floor(durationInMinutes)} minutes`;
  } else {
    return `${Math.floor(durationInSeconds)} seconds`;
  }
};

const infor = (info) => {
  const image = {
    CodeForces: "codeforces",
    LeetCode: "leet_code",
    "CodeForces::Gym": "codeforces_gym",
    TopCoder: "top_coder",
    AtCoder: "at_coder",
    // "CS Academy": "cs_academy",
    CodeChef: "code_chef",
    HackerRank: "hacker_rank", 
    HackerEarth: "hacker_earth",
    // "Kick Start": "kick_start",
    // Toph: "toph",
  };

  const infoParse = {
    contest_name: info.name,
    site_name: info.site,
    duration: durationInSec(info.duration),
    url: info.url,
    in_24_hours: info.in_24_hours.toLocaleLowerCase() === "yes" ? true : false,
    start_time: info.start_time,
    end_time: info.end_time,
    currently_running:
      new Date(Date.parse(info.start_time)) < new Date() &&
      new Date() < new Date(Date.parse(info.end_time)),
    site_logo:
      process.env.NODE_ENV === "development"
        ? `${process.env.BACKEND_URL}/images/${image[info.site]}.png`
        : `http://localhost:${process.env.PORT}/images/${image[info.site]}.png`,
  };
  return infoParse;
};
