import dayjs_ from "dayjs"

export type dayjs = (date?: dayjs_.ConfigType, option?: dayjs_.OptionType, locale?: string) => dayjs_.Dayjs;