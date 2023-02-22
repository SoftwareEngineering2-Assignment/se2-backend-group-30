// This is a JavaScript module that exports a Mongoose model for a dashboard. Here's what it does:

// Imports Mongoose and the mongoose-beautiful-unique-validation plugin.
// Defines a Mongoose schema for the dashboard, specifying its fields and their types, validators, and defaults.
// Adds the mongoose-beautiful-unique-validation plugin to 
// the schema to turn duplicate errors into regular Mongoose validation errors.
// Adds a pre-save hook to the schema that hashes the 
// password field if it has been modified and sets the createdAt 
// field to the current date and time if the name field has been modified.
// Defines a model method that compares hashed passwords.
// Exports the Mongoose model for the dashboards collection.
/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers');

mongoose.pluralize(null);

const DashboardSchema = new mongoose.Schema(
  {
    name: {
      index: true,
      type: String,
      required: [true, 'Dashboard name is required']
    },
    layout: {
      type: Array,
      default: []
    },
    items: {
      type: Object,
      default: {}
    },
    nextId: {
      type: Number,
      min: 1,
      default: 1
    },
    password: {
      type: String,
      select: false,
      default: null
    },
    shared: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {type: Date}
  }
);

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

DashboardSchema.plugin(beautifyUnique);

// Pre save hook that hashes passwords

DashboardSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = passwordDigest(this.password);
  }
  if (this.isModified('name')) {
    this.createdAt = Date.now();
  }
  return next();
});

// Model method that compares hashed passwords

DashboardSchema.methods.comparePassword = function (password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model('dashboards', DashboardSchema);
