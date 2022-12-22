const fs = require('fs');
import process from 'process';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/reviews');

// interfaces for schema
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

interface ICharacteristic {
  name: String,
  id: Number,
  value: String,
};

interface IProduct {
  product_id: Number,
  reviews: IReview[],
  characteristics?: ICharacteristic,
  recommended_true?: Number,
  recommended_false?: Number,
  ratings?: {},
};

// schemas
const reviewSchema = new mongoose.Schema<IReview>({
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
  photos: Array<IPhoto>,
});

const characteristicSchema = new mongoose.Schema<ICharacteristic>({
  name: String,
  value: String,
});

const productSchema = new mongoose.Schema<IProduct>({
  product_id: {type: Number, unique: true},
  reviews: [reviewSchema],
  characteristics: characteristicSchema,
  recommended_true: Number,
  recommended_false: Number,
  ratings: {}
});
const Product = mongoose.model<IProduct>('Product', productSchema);

console.log('generating product IDs...');

// generate basic products table, don't need to run every time
const generateProducts = async () => {
  await Product.collection.drop();
  let index = 0;
  let per = 0;
  const ids: any = {};
  const parser = parse();
  fs.createReadStream('./dist/reviews.csv', {encoding: 'utf8'})
    .pipe(parser)
    .on('data', (row: any) => {
      index++;
      if (Math.floor((index / 5774951) * 100) > per) {
        per = Math.floor((index / 5774951) * 100);
        // percent way through .csv
        console.log(per + '%');
      }

      if (!Number.isNaN(parseInt(row[1]))) {
        ids[row[1]] = {
          product_id: parseInt(row[1]),
          reviews: [],
        };
      }
    })
    .on('end', () => {
      insertReviews(ids);
    });
}

const insertReviews = (obj: any) => {
  console.log('generating reviews...');
  const parser = parse();
  let index = 0;
  let per = 0;
  fs.createReadStream('./dist/reviews.csv', {encoding: 'utf8'})
    .pipe(parser)
    .on('data', (row: string[]) => {
      index++;
      if (index % 100000 === 0) {
        console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
      }
      if (Math.floor((index / 5774951) * 100) > per) {
        per = Math.floor((index / 5774951) * 100);
        // percent way through .csv
        console.log(per + '%');
      }

      // push review to correct product
      if (!Number.isNaN(parseInt(row[1]))) {
        obj[parseInt(row[1])].reviews.push({
          review_id: parseInt(row[0]),
          rating: parseInt(row[2]),
          summary: row[4],
          recommended: row[6] === 'true',
          response: row[10],
          body: row[5],
          date: row[3],
          name: row[8],
          helpfulness: parseInt(row[11]),
          reported: row[7] === 'true',
          photos: [],
        });
      }
    })
    .on('end', async () => {
      // const arr: IProduct[] = [];
      console.log('Inserting reviews!')
      let index = 0;
      let per = 0;
      let len = Object.keys(obj).length;
      for (const key in obj) {
        // tracking
        index++;
        if (index % 100000 === 0) {
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          // percent way through .csv
          console.log(per + '%');
        }

        await Product.create(obj[key]);
        delete obj[key];
      }
      console.log('finished inserting!');
    });
}

generateProducts();
