import { FindOptionsWhere, ILike } from 'typeorm';

export const generateSearchConditions = <T>(searchFields: {
  [key in keyof T]?: string | number | boolean;
}): FindOptionsWhere<T> => {
  const conditions: FindOptionsWhere<T> = {};

  for (const [key, value] of Object.entries(searchFields)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        conditions[key] = ILike(`%${value}%`);
      } else if (typeof value === 'number') {
        conditions[key] = value;
      } else if (typeof value === 'boolean') {
        conditions[key] = value;
      }
    }
  }

  return conditions;
};
