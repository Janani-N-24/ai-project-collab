const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never return by default on queries
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash the plaintext password before saving.
// `this.password` is a virtual (not persisted) set by the controller; only
// runs when it's been provided/changed, so re-saving a user elsewhere never re-hashes.
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compares a plaintext candidate password against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Strip sensitive/internal fields whenever a user document is serialized to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
