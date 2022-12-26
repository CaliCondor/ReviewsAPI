import * as fs from 'fs';
import process from 'process';
import { parse } from 'csv-parse';
import Product from '../db/productReviews';

// generate basic products table, don't need to run every time
const generateProducts = async () => {
  await Product.collection.drop();
  let index = 0;
  let per = 0;
  const ids: any = {};
  const parser = parse();
  console.log('generating product IDs...');
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
      console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
      insertPhotos();
    });
}

const insertPhotos = () => {
  let index = 0;
  let per = 0;
  let obj: any = {};
  console.log('reading csv...');
  fs.createReadStream('./dist/reviews_photos.csv', {encoding: 'utf8'})
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
      console.log('writing photos to db...');
      let len = Object.keys(obj).length;
      for (const key in obj) {
        index++;
        if (index % 100000 === 0) {
          console.log('memory usage: ', Math.round((process.memoryUsage().rss) / 1024 / 1024), 'MB');
        }
        if (Math.floor((index / len) * 100) > per) {
          per = Math.floor((index / len) * 100);
          console.log(per + '%');
        }

        await Product.findOneAndUpdate(
          {'reviews.review_id': parseInt(key)},
          {'$set': {
            'reviews.$.photos': obj[key]
          }});
        delete obj[key];
      }
      readCharacteristics();
    });
};

const readCharacteristics = () => {
  const obj: any = {};
  console.log('applying characteristics to products...');
  fs.createReadStream('./dist/characteristics.csv', {encoding: 'utf8'})
    .pipe(parse())
    .on('data', (row) => {
      if (!Number.isNaN(parseInt(row[0]))) {
        obj[row[1]] = {
          name: row[2],
          id: row[0],
        };
      }
    })
    .on('end', () => {

    });
};

readCharacteristics();
