import { Inject } from "@nestjs/common";
import { DAYJS } from "./dayjs.constants";

export function InjectDayjs() {
  return Inject(DAYJS);
}