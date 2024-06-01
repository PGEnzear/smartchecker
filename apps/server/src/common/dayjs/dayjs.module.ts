import { Global, Module } from "@nestjs/common";
import * as dayjs from "dayjs"
import * as localizedFormat from "dayjs/plugin/localizedFormat"
import { DAYJS } from "./dayjs.constants";

dayjs.extend(localizedFormat)

@Global()
@Module({
  providers: [{
    provide: DAYJS,
    useValue: dayjs,
  }],
  exports: [DAYJS]
})
export class DayJSModule {}