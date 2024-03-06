import { Injectable } from "@nestjs/common";
import dayjs, { Dayjs } from "dayjs";

@Injectable()
export class TimeService {
  constructor(
  ) { }

  get now() {
    return Date.now();
  }

  get nowDate() {
    return new Date();
  }

  get nowDayjs() {
    return new Dayjs();
  }
}