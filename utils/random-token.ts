import crypto from "node:crypto";

export const getRandomToken = (size: number = 64) => crypto.randomBytes(size).toString('hex');
