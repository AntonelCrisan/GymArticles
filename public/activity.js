const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    action: { type: String, required: true, enum: ["viewed", "added_to_favorite", "added_to_cart", "purchased"] },
    timestamp: { type: Number, required: true }
  });
  
  const Activity = mongoose.model("Activity", activitySchema);
  
  module.exports = Activity;