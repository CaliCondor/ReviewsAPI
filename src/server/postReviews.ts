import { Request, Response } from "express";
import Product, { ReviewCount } from "../db/productReviews";

const postReviews = async (req: Request, res: Response) => {
  if (!verifyReq(req)) {
    res.status(422);
    res.send("Error: malformed request");
    return;
  }

  const rating = parseInt(req.query.rating as string);
  const recommended = req.query.recommended === "true";
  const photos = (req.query.photos as string[]).map(
    (photo: string, i: number) => {
      return {
        id: i,
        url: photo,
      };
    }
  );

  try {
    const reviewCount = await ReviewCount.findOne({});
    if (!reviewCount) throw new Error();

    const product = await Product.findOne({ product_id: req.query.product_id });
    if (!product) {
      res.status(422);
      res.send("Error: malformed request");
      return;
    }

    product.reviews.push({
      review_id: reviewCount.count + 1,
      rating: rating,
      summary: req.query.summary as string,
      recommended: recommended,
      body: req.query.body as string,
      name: req.query.name as string,
      photos: photos,
      response: "",
      date: "" + new Date(),
      helpfulness: 0,
      reported: false,
    });
    await product.save();
    reviewCount.count = reviewCount.count + 1;
    await reviewCount.save();

    res.status(202);
    res.send();
  } catch {
    res.status(500);
    res.send("Internal server error");
  }
};

const verifyReq = ({ query }: Request): boolean => {
  // TODO: verify request
  if (
    !query.product_id ||
    !query.rating ||
    !query.summary ||
    !query.body ||
    !query.recommended ||
    !query.name ||
    !query.email ||
    !query.photos
  ) {
    return false;
  }
  return true;
};

export default postReviews;
