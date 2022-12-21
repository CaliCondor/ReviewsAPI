const fs = require('fs');
import { parse } from 'csv-parse';
import mongoose, { Mongoose } from 'mongoose';
mongoose.connect('mongodb://localhost:27017/reviews');

// interfaces for schema
interface IPhoto {
  id: Number,
  url: String,
};

interface IReview {
  id: Number,
  rating: Number,
  summary: String,
  recommended: Boolean,
  response: String,
  body: String,
  date: String,
  name: String,
  helpfulness: Number,
  reports: Number,
  photos: Array<IPhoto>,
};

interface ICharacteristic {
  name: String,
  id: Number,
  value: String,
};

interface IProduct {
  product_id: Number,
  reviews?: IReview,
  characteristics?: ICharacteristic,
  recommended_true?: Number,
  recommended_false?: Number,
  ratings?: {},
};

// schemas
const reviewSchema = new mongoose.Schema<IReview>({
  rating: Number,
  summary: String,
  recommended: Boolean,
  response: String,
  body: String,
  date: String,
  name: String,
  helpfulness: Number,
  reports: Number,
  photos: Array<IPhoto>,
});

const characteristicSchema = new mongoose.Schema<ICharacteristic>({
  name: String,
  value: String,
});

const productSchema = new mongoose.Schema<IProduct>({
  product_id: {type: Number, unique: true},
  reviews: reviewSchema,
  characteristics: characteristicSchema,
  recommended_true: Number,
  recommended_false: Number,
  ratings: {}
});
const Product = mongoose.model<IProduct>('Product', productSchema);

console.log('reading CSV...');
const parser = parse();

// generate basic products table
let index = 0;
let per = 0;
const ids: { [key: string]: any } = {};
fs.createReadStream('./reviews.csv', {encoding: 'utf8'})
  .pipe(parser)
  .on('data', (row: any) => {
    index++;
    if (Math.floor((index / 5774952) * 100) > per) {
      per = Math.floor((index / 5774952) * 100);
      // percent way through .csv
      console.log(per + '%');
    }

    if (!Number.isNaN(row[1])) {
      ids[row[1]] = 1;
    }
  })
  .on('end', () => {
    console.log('creating arr...');
    // insert ids into an array of objects matching the schema
    const arr: Array<IProduct> = [];
    Object.keys(ids).forEach((id) => {
      if (!Number.isNaN(parseInt(id))) {
        arr.push({
          product_id: parseInt(id),
        });
      }
    });
    console.log('inserting...');
    // insert all product ids into db
    Product.insertMany(arr);
    console.log('finished inserting!');
  });