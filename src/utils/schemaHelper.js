/**
 * Standardizes Mongoose schemas to transform _id to id and remove __v
 * when converting to JSON or Objects.
 */
export const transformSchema = (schema) => {
  schema.set('toJSON', {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });

  schema.set('toObject', {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
};
