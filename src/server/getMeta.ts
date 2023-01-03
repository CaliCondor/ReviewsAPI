import { Request, Response } from 'express';
import Product from '../db/productReviews';

// characteristics send by API are shaped differently than the DB stores them
interface Characteristic {
  id: number,
  value: string,
}

const getMeta = async (req: Request, res: Response) => {
  // check to ensure request has a product id
  if (!req.query.product_id) {
    res.status(422);
    res.send('Error: invalid product_id provided');
    return;
  }

  try {
    // parse query params for product id
    const product_id = parseInt(req.query.product_id as string);

    // query DB for product
    const product = await Product.findOne({ product_id: product_id }).lean();

    // meta objects containers
    const ratings: Record<string, string> = {
      '1': '0',
      '2': '0',
      '3': '0',
      '4': '0',
      '5': '0',
    };
    const recommended: Record<string, string> = {
      'false': '0',
      'true': '0',
    };

    // read characteristics from db, calculate average value
    const characteristics: Record<string, Characteristic> = {};
    if (product?.characteristics) {
      product.characteristics.forEach((c) => {
        characteristics[c.name] = {
          id: c.characteristic_id,
          value: '' + (c.values.reduce((a:number, b:number) => a + b, 0) / c.values.length)
        };
      });
    }

    // edit containers based on queried data
    product?.reviews.forEach((review) => {
      ratings['' + review.rating] = '' + (parseInt(ratings['' + review.rating]) + 1);
      recommended['' + review.recommended] = '' + parseInt(recommended['' + review.recommended] + 1);
    });

    res.send({
      product_id: '' + product_id,
      ratings,
      recommended,
      characteristics
    });
  } catch {
    res.status(500);
    res.send('Internal server error');
  }
};

export default getMeta;
