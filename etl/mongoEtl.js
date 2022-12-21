"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const csv_parse_1 = require("csv-parse");
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect('mongodb://localhost:27017/reviews');
;
;
;
;
// schemas
const reviewSchema = new mongoose_1.default.Schema({
    rating: Number,
    summary: String,
    recommended: Boolean,
    response: String,
    body: String,
    date: String,
    name: String,
    helpfulness: Number,
    reports: Number,
    photos: (Array),
});
const characteristicSchema = new mongoose_1.default.Schema({
    name: String,
    value: String,
});
const productSchema = new mongoose_1.default.Schema({
    product_id: { type: Number, unique: true },
    reviews: reviewSchema,
    characteristics: characteristicSchema,
    recommended_true: Number,
    recommended_false: Number,
    ratings: {}
});
const Product = mongoose_1.default.model('Product', productSchema);
console.log('reading CSV...');
const parser = (0, csv_parse_1.parse)();
// generate basic products table
let index = 0;
let per = 0;
const ids = {};
fs.createReadStream('./reviews.csv', { encoding: 'utf8' })
    .pipe(parser)
    .on('data', (row) => {
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
    .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('creating arr...');
    // insert ids into an array of objects matching the schema
    const arr = [];
    Object.keys(ids).forEach((id) => __awaiter(void 0, void 0, void 0, function* () {
        if (!Number.isNaN(parseInt(id))) {
            arr.push({
                product_id: parseInt(id),
            });
        }
    }));
    console.log('inserting...');
    // insert all product ids into db
    Product.insertMany(arr);
    console.log('finished inserting!');
}));
