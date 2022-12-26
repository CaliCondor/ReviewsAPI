import express from 'express';
import Product from '../db/productReviews';

const app = express();
const port = 3000;

app.get('/reviews', async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const count = req.query.count ? parseInt(req.query.count as string) : 5;
  const product_id = parseInt(req.query.product_id as string);
  const { sort } = req.query;
  console.log('ID:', product_id);
  console.log('page:', page);
  console.log('sort:', sort);
  console.log('count:', count);
  const product = await Product.findOne({ product_id: product_id });
  res.send(product?.reviews);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});