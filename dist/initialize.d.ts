import { Dayjs } from 'dayjs';
declare global {
    interface Date {
        toDayjs: (format?: string) => Dayjs;
    }
    interface Number {
        toDayjs: (format?: string) => Dayjs;
        format: (format: string) => string;
    }
    interface String {
        toDayjs: (format?: string) => Dayjs;
        toNumber: () => number;
    }
}
