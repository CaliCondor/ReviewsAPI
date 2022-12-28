import { Request, Response } from 'express';
import Product from '../db/productReviews';

// request handler for /reviews GET endpoint
const getReviews = async (req: Request, res: Response) => {
  // check to ensure request has a product id
  if (!req.query.product_id) {
    res.status(422);
    res.send('Error: invalid product_id provided');
    return;
  }

  try {
    // parse query params
    const product_id = parseInt(req.query.product_id as string);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const count = req.query.count ? parseInt(req.query.count as string) : 5;
    // TODO: figure out how the sorting works
    // const { sort } = req.query;

    // get all the reviews, then filter the reviews by the page and count
    const query = await Product.findOne({ product_id: product_id }, 'reviews');
    const reviews = query?.reviews.slice((page - 1) * count, page * count);

    res.send({
      product: '' + product_id,
      page,
      count,
      results: reviews
    });
  } catch {
    res.status(500);
    res.send('Internal server error');
  }

};

export default getReviews;
