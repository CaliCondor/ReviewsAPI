import mongoose from 'mongoose';
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/reviews');

/* INTERFACES FOR SCHEMAS */

export interface IPhoto {
  id: number,
  url: string,
}

interface IReview {
  review_id: number,
  rating: number,
  summary: string,
  recommended: boolean,
  response: string,
  body: string,
  date: string,
  name: string,
  helpfulness: number,
  reported: boolean,
  photos?: Array<IPhoto>,
}

export interface ICharacteristic {
  characteristic_id: number,
  name: string,
  values: number[],
}

export interface IProduct {
  product_id: number,
  reviews: IReview[],
  characteristics: ICharacteristic[],
}


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

// characteristic documents store a characteristic as well as all values
const characteristicSchema = new mongoose.Schema<ICharacteristic>({
  characteristic_id: Number,
  name: String,
  values: Array<number>,
});

// product documents store the product id, as well as all the review sub documents
const productSchema = new mongoose.Schema<IProduct>({
  product_id: {type: Number, index: { unique: true }},
  reviews: [reviewSchema],
  characteristics: [characteristicSchema],
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;