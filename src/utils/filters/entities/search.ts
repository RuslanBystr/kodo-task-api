import { FindOptionsWhere, ILike } from 'typeorm';

export const generateSearchConditions = <T>(searchFields: {
  [key in keyof T]?: string | number | boolean;
}): FindOptionsWhere<T> => {
  const conditions: FindOptionsWhere<T> = {};

  for (const [key, value] of Object.entries(searchFields)) {
    if (value !== undefined && value !== null) {
      // Use ILike for string fields, exact match for others
      if (typeof value === 'string') {
        (conditions as any)[key] = ILike(`%${value}%`);
      } else {
        (conditions as any)[key] = value; // Exact match for numbers or booleans
      }
    }
  }

  return conditions;
};
