import { Request, Response } from 'express';
import Product, { ReviewCount } from '../db/productReviews';

const postReviews = async (req: Request, res: Response) => {
  if (!verifyReq(req)) {
    res.status(422);
    res.send('Error: malformed request');
    return;
  }

  try {
    const reviewCount = await ReviewCount.findOne({});

    if (reviewCount) {
      reviewCount.count = reviewCount.count + 1;
      reviewCount.save();
    }
  } catch {
    res.status(500);
    res.send('Internal server error');
  }
};

const verifyReq = (req: Request): boolean => {
  // TODO: verify request
  if (!req.query.product_id) {
    return false;
  }
  return true;
}

export default postReviews;