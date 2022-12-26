import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/reviews');

/* INTERFACES FOR SCHEMAS */

interface IPhoto {
  id: Number,
  url: String,
};

interface IReview {
  review_id: Number,
  rating: Number,
  summary: String,
  recommended: Boolean,
  response: String,
  body: String,
  date: String,
  name: String,
  helpfulness: Number,
  reported: Boolean,
  photos?: Array<IPhoto>,
};

interface IProduct {
  product_id: Number,
  reviews: IReview[],
};


/* SCHEMA DEFINITIONS */

// review documents store individual reviews
const reviewSchema = new mongoose.Schema<IReview>({
  review_id: {type: Number, index: { unique: true }},
  rating: Number,
  summary: String,
  recommended: Boolean,
  response: String,
  body: String,
  date: String,
  name: String,
  helpfulness: Number,
  reported: Boolean,
  photos: Array<IPhoto>,
});

// product documents store the product id, as well as all the review sub documents
const productSchema = new mongoose.Schema<IProduct>({
  product_id: {type: Number, index: { unique: true }},
  reviews: [reviewSchema],
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;