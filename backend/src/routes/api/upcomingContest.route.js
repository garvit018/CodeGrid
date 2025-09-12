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

// const infor = (info) => {
//   const image = {
//     CodeForces: "codeforces",
//     LeetCode: "leet_code",
//     AtCoder: "at_coder",
//     CodeChef: "code_chef",
//   };

//   const infoParse = {
//     contest_name: info.name,
//     site_name: info.site,
//     duration: durationInSec(info.duration),
//     url: info.url,
//     in_24_hours: info.in_24_hours.toLocaleLowerCase() === "yes" ? true : false,
//     start_time: info.start_time,
//     end_time: info.end_time,
//     currently_running:
//       new Date(Date.parse(info.start_time)) < new Date() &&
//       new Date() < new Date(Date.parse(info.end_time)),
//     site_logo:
//       process.env.NODE_ENV === "development"
//         ? `${process.env.BACKEND_URL}/images/${image[info.site]}.png`
//         : `http://localhost:${process.env.PORT}/images/${image[info.site]}.png`,
//   };
//   return infoParse;
// };
const parseInfo = (info) => {
  return {
    contest_name: info.name,
    site_name: "CodeForces",
    duration: durationInSec(info.durationSeconds),
    url: `https://codeforces.com/contest/${info.id}`,
    in_24_hours:
      new Date(info.startTimeSeconds * 1000) - new Date() <=
      24 * 60 * 60 * 1000,
    start_time: new Date(info.startTimeSeconds * 1000).toISOString(),
    end_time: new Date(
      (info.startTimeSeconds + info.durationSeconds) * 1000
    ).toISOString(),
    currently_running:
      new Date(info.startTimeSeconds * 1000) < new Date() &&
      new Date() <
        new Date((info.startTimeSeconds + info.durationSeconds) * 1000),
    site_logo:
      process.env.NODE_ENV === "development"
        ? `${process.env.BACKEND_URL}/images/codeforces.png`
        : `http://localhost:${process.env.PORT}/images/codeforces.png`,
  };
};
router.route("/").get((req, res, next) => {
  const url = `https://codeforces.com/api/contest.list`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status !== "OK") {
        return res.status(500).send({ error: "Failed to fetch contests" });
      }

      const contests = data.result
        .filter((c) => c.phase === "BEFORE")
        .map((c) => parseInfo(c));

      res.send(contests);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

export default router;

// router.route("/").get((req, res, next) => {
  // const url = `https://kontests.net/api/v1/all`;
  // const options = {
  //     method: 'GET'
  // };
  // fetch(url, options)
  //     .then(response => response.json())
  //     .then(data => {
  //         // res.send(data);
  //         res.send(data.map((info) => infoParse(info)));
  //     }
  //     )
  //     .catch(error => {
  //         console.log(error);
  //         res.status(500).send(error);
  //     }
  //     )
//   res.status(200);
// });

// router.route("/:site").get((req, res, next) => {
  //   const { site } = req.params;
  //   const url = `https://kontests.net/api/v1/${site}`;
  //   const options = {
  //     method: "GET",
  //   };
  //   fetch(url, options)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       res.send(
  //         data
  //           .map((info) => infoParse(info))
  //           .map((info) => {
  //             info.site_logo =
  //               process.env.NODE_ENV === "development"
  //                 ? `${process.env.BACKEND_URL}/images/${site}.png`
  //                 : `http://localhost:${process.env.PORT}/images/${site}.png`;
  //             return info;
  //           })
  //       );
  // })
  // .catch((error) => {
  //   console.log(error);
  //   res.status(500).send(error);
  // });
//   res.status(200);
// });

// export default router;
