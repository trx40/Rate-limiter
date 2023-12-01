import express from "express";
import { tokenBucketRateLimiter } from "./token_bucket";
const app = express();
const port = 3000;

app.get("/unlimited", (req, res) => {
  res.send("Unlimited!");
});

app.get("/limited", (req, res) => {
  if (tokenBucketRateLimiter.handleRequest("127.0.0.1")) {
    console.log("Request accepted");
    res.status(200).send("Request accepted");
  } else {
    console.log("Request denied");
    res.status(429).send("Too many requests");
  }
  // res.send("Limited, dont over use!");
});

app.listen(port, () => {
  console.log(`App listening on port : ${port}`);
});
