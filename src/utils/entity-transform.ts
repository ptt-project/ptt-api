import dayjs, { Dayjs } from 'dayjs';
import { ValueTransformer } from 'typeorm';

export const transformerDecimalToNumber: ValueTransformer = {
  to: (value) => value,
  from: (value: string) => Number(value),
};

export const transformerDayjsToDate: ValueTransformer = {
  to: (value) => {
    if (dayjs.isDayjs(value)) {
      return value.toDate();
    } else {
      return value;
    }
  },
  from: (value: Date) => {
    return value;
  },
};
