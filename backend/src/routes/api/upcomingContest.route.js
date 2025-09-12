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

  if (durationInYears > 1) return `${Math.floor(durationInYears)} years`;
  if (durationInMonths > 1) return `${Math.floor(durationInMonths)} months`;
  if (durationInWeeks > 1) return `${Math.floor(durationInWeeks)} weeks`;
  if (durationInDays > 1) return `${Math.floor(durationInDays)} days`;
  if (durationInHours > 1) return `${Math.floor(durationInHours)} hours`;
  if (durationInMinutes > 1) return `${Math.floor(durationInMinutes)} minutes`;
  return `${Math.floor(durationInSeconds)} seconds`;
};

const siteImageMap = {
  "codeforces.com": "codeforces.png",
  "codechef.com": "code_chef.png",
  "leetcode.com": "leet_code.png",
  "atcoder.jp": "at_coder.png",
};

const parseInfo = (info) => {
  const start = new Date(info.start);
  const end = new Date(info.end);
  const now = new Date();

  return {
    contest_name: info.event,
    site_name: info.resource.name,
    duration: durationInSec(info.duration),
    url: info.href,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    currently_running: start < now && now < end,
    in_24_hours: start - now <= 24 * 60 * 60 * 1000 && start - now > 0,
    site_logo: `${
      process.env.BACKEND_URL || "http://localhost:" + process.env.PORT
    }/images/${siteImageMap[info.resource.name]}`,
  };
};

router.route("/").get(async (req, res) => {
  const url = `https://clist.by/api/v4/contest/?limit=1000000&total_count=true&with_problems=true&upcoming=true&format_time=true&start_time__during=0%20days&end_time__during=9999%20days&filtered=true&order_by=duration`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error("Failed to fetch contests from Clist API");
    const data = await response.json();

    if (!data.objects) {
      return res.status(500).send({ error: "No contests found" });
    }

    const filtered = data.objects.filter((c) =>
      Object.keys(siteImageMap).includes(c.resource.name)
    );
    const contests = filtered
      .map(parseInfo)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    res.status(200).json(contests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
