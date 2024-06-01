// @ts-ignore
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export const uuid = (uuid: string) => uuidValidate(uuid) && uuidVersion(uuid) === 4