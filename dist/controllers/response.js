"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response = (statusCode, message, datas, res) => {
    res.status(statusCode).json({
        status_code: statusCode,
        message: message,
        datas: datas || [],
    });
};
exports.default = response;
//# sourceMappingURL=response.js.map