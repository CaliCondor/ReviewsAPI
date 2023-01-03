import express from 'express';
import mongoose from 'mongoose';
import getReviews from './getReviews';
import getMeta from './getMeta';
import postReviews from './postReviews';

const app = express();
const port = 3000;

app.get('/reviews', getReviews);
app.get('/reviews/meta', getMeta);
app.post('/reviews', postReviews);

(async () => {
  const options = {
    useUnifiedTopology: true,
    minPoolSize: 100,
    maxPoolSize: 500,
  }
  mongoose.connect('mongodb://localhost:27017/reviews', options);
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();

