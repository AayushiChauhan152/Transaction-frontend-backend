import express from "express";
import transaction from "../models/data.js";
const router = express.Router();

// API to list all transactions with search and pagination
router.get("/list-transactions", async (req, res) => {
  try {
    var selectedMonth = req.query.month;

    selectedMonth = selectedMonth.toLowerCase();
    var months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    var idx = months.indexOf(selectedMonth) + 1;
    idx = idx < 10 ? "0" + idx : idx + "";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const searchText = req.query.search_text || "";

    // Create a query based on search parameters
    const query = {
      dateOfSale: {
        $regex: new RegExp(idx, "i"),
      },
      $or: [
        { title: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
      ],
    };

    const transactions = await transaction
      .find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API for statistics
router.get("/statistics", async (req, res) => {
  try {
    var selectedMonth = req.query.month;

    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var idx = months.indexOf(selectedMonth) + 1;
    idx = idx < 10 ? "0" + idx : idx + "";

    const totalSaleAmount = await transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $regex: new RegExp(idx, "i"),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: "$price" },
        },
      },
    ]);

    const totalSoldItems = await transaction.countDocuments({
      dateOfSale: {
        $regex: new RegExp(idx, "i"),
      },
      sold: true,
    });

    const totalNotSoldItems = await transaction.countDocuments({
      dateOfSale: {
        $regex: new RegExp(idx, "i"),
      },
      sold: false,
    });

    res.render("statistics.ejs", {
      totalSaleAmount:
        totalSaleAmount.length > 0 ? totalSaleAmount[0].totalSaleAmount : 0,
      totalSoldItems,
      totalNotSoldItems,
      selectedMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API for bar chart
router.get("/bar-chart", async (req, res) => {
  try {
    const priceRanges = [
      { start: 0, end: 100 },
      { start: 101, end: 200 },
      { start: 201, end: 300 },
      { start: 301, end: 400 },
      { start: 401, end: 500 },
      { start: 501, end: 600 },
      { start: 601, end: 700 },
      { start: 701, end: 800 },
      { start: 801, end: 900 },
      { start: 901, end: Infinity },
    ];
    var selectedMonth = req.query.month;

    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var idx = months.indexOf(selectedMonth) + 1;
    idx = idx < 10 ? "0" + idx : idx + "";

    const labels = [];
    const data = [];
    for (const { start, end } of priceRanges) {
      const count = await transaction.countDocuments({
        dateOfSale: {
          $regex: new RegExp(idx, "i"),
        },
        price: { $gte: start, $lt: end },
      });

      labels.push(`${start}-${end}`);
      data.push(count);
      //   result[`${start}-${end}`] = count;
    }

    console.log(data);
    res.render("barChart.ejs", { selectedMonth, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//API for pie chart
router.get("/pie-chart", async (req, res) => {
  try {
    var selectedMonth = req.query.month;

    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var idx = months.indexOf(selectedMonth) + 1;
    idx = idx < 10 ? "0" + idx : idx + "";

    const pipeline = [
      {
        $match: {
          dateOfSale: {
            $regex: new RegExp(idx, "i"),
          },
        },
      },

      { $group: { _id: "$category", count: { $sum: 1 } } },
    ];

    const categories = await transaction.aggregate(pipeline);
    const result = categories.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, {});

    const keys = [];
    const values = [];
    for (const k in result) {
      if (result.hasOwnProperty(k)) {
        keys.push(k);
        values.push(result[k]);
      }
    }

    res.render("pieChart.ejs", { keys, values });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
