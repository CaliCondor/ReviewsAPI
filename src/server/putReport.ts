import { Request, Response } from "express";
import Product from "../db/productReviews";

const putReport = async (req: Request, res: Response) => {
  try {
    await Product.findOneAndUpdate(
      { "reviews.review_id": parseInt(req.params.review_id) },
      {
        $set: {
          "reviews.$.reported": true,
        },
      }
    );
    res.status(204);
    res.send();
  } catch {
    res.status(500);
    res.send("Internal server error");
  }
};

export default putReport;
