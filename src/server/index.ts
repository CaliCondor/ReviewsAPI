import express from "express";
import mongoose from "mongoose";
import getReviews from "./getReviews";
import getMeta from "./getMeta";
import postReviews from "./postReviews";
import putReport from "./putReport";

const app = express();
const port = 3000;

app.get("/reviews", getReviews);
app.get("/reviews/meta", getMeta);
app.post("/reviews", postReviews);
app.put("/reviews/:review_id/report", putReport);

(async () => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    minPoolSize: 100,
    maxPoolSize: 5000,
  };
  await mongoose.connect(
    "mongodb://localhost:27017/reviews?directConnection=true",
    options
  );
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();

module.exports = app;
