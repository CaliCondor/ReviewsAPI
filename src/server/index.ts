import express from 'express';
import getReviews from './getReviews';
import getMeta from './getMeta';

const app = express();
const port = 3000;

app.get('/reviews', getReviews);

app.get('/reviews/meta', getMeta);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});