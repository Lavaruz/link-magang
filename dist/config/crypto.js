"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
function encrypt(data, key = process.env.AES_KEYS) {
    if (process.env.SECURE == 'false')
        return data;
    if (typeof data == 'object')
        data = JSON.stringify(data);
    return { r: crypto_js_1.default.AES.encrypt(data, key).toString() };
}
exports.encrypt = encrypt;
function decrypt(data, key = process.env.AES_KEYS) {
    if (process.env.SECURE == 'false')
        return data;
    var bytes = crypto_js_1.default.AES.decrypt(data, key);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
}
exports.decrypt = decrypt;
;
//# sourceMappingURL=crypto.js.map