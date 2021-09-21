"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getG4ApiError = void 0;
var axios_1 = __importDefault(require("axios"));
function getG4ApiError(error) {
    var _a, _b, _c, _d;
    if (!axios_1.default.isAxiosError(error))
        return { source: "other", message: "unknown error" };
    if (typeof error.code !== "undefined")
        return { source: "network", code: error.code, message: error.message };
    var g4error = (_a = error.response) === null || _a === void 0 ? void 0 : _a.headers["x-g4-error"];
    if (typeof g4error !== "undefined")
        return { source: "g4", message: g4error };
    var status = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data.status;
    if (typeof status === "number") {
        switch (status) {
            case 400:
                var statusText = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data.statusText;
                if (typeof statusText === "undefined") {
                    return {
                        source: "validation",
                        message: JSON.stringify((_d = error.response) === null || _d === void 0 ? void 0 : _d.data.errors),
                    };
                }
                else {
                    return {
                        source: "http",
                        message: statusText,
                    };
                }
            case 401:
                return { source: "auth", message: "unauthorized request" };
            default:
                return { source: "http", message: "status: " + status };
        }
    }
    return { source: "other", message: error.name + ": " + error.message };
}
exports.getG4ApiError = getG4ApiError;
