const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    department:{ type: String, default: "" },
    salary:    { type: Number, default: 0 },
    imageUrl:  { type: String, default: "" },
  },
  { timestamps: true }
);

// Expose Mongo _id as "id" string so the frontend API shape stays identical
employeeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
