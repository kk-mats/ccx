import * as t from "io-ts";
import { brand } from "common/all/codecs";

export const encryptedPassword = brand(t.string, "EncryptedPassword");
export const cleartextPassword = brand(t.string, "CleartextPassword");
