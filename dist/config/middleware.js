"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAES = void 0;
const crypto_1 = require("./crypto");
function decryptAES(req, res, next) {
    req.body = JSON.parse((0, crypto_1.decrypt)(req.body.d));
    next();
}
exports.decryptAES = decryptAES;
//# sourceMappingURL=middleware.js.map