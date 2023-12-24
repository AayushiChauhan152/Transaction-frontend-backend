import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  dateOfSale: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  sold: {
    type: Boolean,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
});

const transaction = new mongoose.model("transaction", transactionSchema);

export default transaction;
