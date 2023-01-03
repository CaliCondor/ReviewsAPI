import * as fs from 'fs';
import process from 'process';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';
import Product, { IProduct, IPhoto, ICharacteristic, ReviewCount } from '../db/productReviews';

const options = {
  useUnifiedTopology: true,
  minPoolSize: 100,
  maxPoolSize: 500,
}
mongoose.connect('mongodb://localhost:27017/reviews', options);

// generate basic products table, don't need to run every time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateProducts = async () => {
  await Product.collection.drop();
  const ids: Record<string, IProduct> = {};
  const parser = parse();
  console.log('generating product IDs...');
  fs.createReadStream('./build/etl/reviews.csv', {encoding: 'utf8'})
    .pipe(parser)
    .on('data', (row: string[]) => {
      if (!Number.isNaN(parseInt(row[1]))) {
        ids[row[1]] = {
          product_id: parseInt(row[1]),
          reviews: [],
          characteristics: [],
        };
      }
    })
    .on('end', () => {
      console.log('finished generating product ids!')
      insertReviews(ids);
    });
}

// insert individual review subdocuments
const insertReviews = (obj: Record<string, IProduct>) => {
  console.log('generating reviews...');
  const parser = parse();
  fs.createReadStream('./build/etl/reviews.csv', {encoding: 'utf8'})
    .pipe(parser)
    .on('data', (row: string[]) => {
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
      console.log('inserting reviews...')
      let index = 0;
      let per = 0;
      const len = Object.keys(obj).length;
      await ReviewCount.create({
        count: len
      });
      for (const key in obj) {
        // tracking
        index++;
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          console.log(per + '%');
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }

        await Product.create(obj[key]);
        delete obj[key];
      }
      console.log('finished inserting reviews!');
      console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
      insertPhotos();
    });
}

// insert photos into review subdocuments
const insertPhotos = () => {
  let index = 0;
  let per = 0;
  const obj: Record<string, IPhoto[]> = {};
  console.log('generating photos...');
  fs.createReadStream('./build/etl/reviews_photos.csv', {encoding: 'utf8'})
    .pipe(parse())
    .on('data', (row: string[]) => {
      if (!Number.isNaN(parseInt(row[1]))) {
        if (obj[row[1]] === undefined) obj[row[1]] = [];
        obj[row[1]].push({
          id: parseInt(row[0]),
          url: row[2],
        });
      }
    })
    .on('end', async () => {
      console.log('insertings photos...');
      const len = Object.keys(obj).length;
      for (const key in obj) {
        index++;
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          console.log(per + '%');
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }

        await Product.findOneAndUpdate(
          {'reviews.review_id': parseInt(key)},
          {'$set': {
            'reviews.$.photos': obj[key]
          }});
        delete obj[key];
      }
      console.log('finished inserting photos!');
      readCharacteristics();
    });
};

// initialize characteristics
const readCharacteristics = () => {
  const obj: Record<string, ICharacteristic[]> = {};
  console.log('generating characteristics...');
  fs.createReadStream('./build/etl/characteristics.csv', {encoding: 'utf8'})
    .pipe(parse())
    .on('data', (row) => {
      if (!Number.isNaN(parseInt(row[0]))) {
        if (obj[row[1]] === undefined) obj[row[1]] = [];
        obj[row[1]].push({
          name: row[2],
          characteristic_id: parseInt(row[0]),
          values: [],
        });
      }
    })
    .on('end', async () => {
      console.log('inserting characteristics...');
      const len = Object.keys(obj).length;
      let index = 0;
      let per = 0;

      for (const key in obj) {
        index++;
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          console.log(per + '%');
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }

        await Product.findOneAndUpdate({ product_id: key }, { $set: { characteristics: obj[key] }});
        delete obj[key];
      }
      console.log('finished inserting characteristics!');
      characteristicReviews();
    });
};

const characteristicReviews = () => {
  console.log('generating characteristic reviews...');
  const obj: Record<string, number[]> = {};
  fs.createReadStream('./build/etl/characteristic_reviews.csv', {encoding: 'utf8'})
    .pipe(parse())
    .on('data', (row: string[]) => {
      if (!Number.isNaN(parseInt(row[0]))) {
        if (obj[row[1]] === undefined) obj[row[1]] = [];
        obj[row[1]].push(parseInt(row[3]));
      }
    })
    .on('end', async () => {
      console.log('inserting characteristic reviews...');
      const len = Object.keys(obj).length;
      let index = 0;
      let per = 0;

      for (const key in obj) {
        index++;
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          console.log(per + '%');
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }

        await Product.findOneAndUpdate(
          { 'characteristics.characteristic_id': parseInt(key) },
          { '$set': {
            'characteristics.$.values': obj[key],
          }}
        );
        delete obj[key];
      }

      console.log('finished inserting characteristic reviews!!!!')
    });
};

generateProducts();
