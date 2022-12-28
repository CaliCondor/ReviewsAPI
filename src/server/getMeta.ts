import { Request, Response } from 'express';
import Product from '../db/productReviews';

const getMeta = async (req: Request, res: Response) => {
  const product_id = parseInt(req.query.product_id as string);
  const product = await Product.findOne({ product_id: product_id });

  // meta objects, edited by iterating through the product's reviews
  const ratings = {
    '1': '0',
    '2': '0',
    '3': '0',
    '4': '0',
    '5': '0',
  };
  const recommended = {
    'false': '0',
    'true': '0',
  };
  const characteristics = product?.characteristics;

  res.send({
    'product_id': product_id + '',
    'ratings': ratings,
    'recommended': recommended,
    'characteristics': characteristics
  });
};

export default getMeta;
