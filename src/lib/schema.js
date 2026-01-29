"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResourcesTable = createResourcesTable;
exports.createUsersTable = createUsersTable;
exports.createReservationsTable = createReservationsTable;
function executeQuery(client, query) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query(query)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createResourcesTable(client) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "\n    CREATE TABLE IF NOT EXISTS resources (\n      id UUID PRIMARY KEY,\n      name VARCHAR(255) NOT NULL,\n      type VARCHAR(255) NOT NULL,\n      location VARCHAR(255) NOT NULL,\n      capacity INTEGER NOT NULL,\n      equipment TEXT[],\n      \"imageUrl\" VARCHAR(255),\n      tags TEXT[],\n      \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n    );\n  ";
                    return [4 /*yield*/, executeQuery(client, query)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createUsersTable(client) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "\n    CREATE TABLE IF NOT EXISTS users (\n      id UUID PRIMARY KEY,\n      name VARCHAR(255) NOT NULL,\n      email VARCHAR(255) UNIQUE NOT NULL,\n      role VARCHAR(50) NOT NULL DEFAULT 'User',\n      \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n    );\n  ";
                    return [4 /*yield*/, executeQuery(client, query)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createReservationsTable(client) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Enable pgcrypto extension for gen_random_uuid()
                return [4 /*yield*/, client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')];
                case 1:
                    // Enable pgcrypto extension for gen_random_uuid()
                    _a.sent();
                    query = "\n    CREATE TABLE IF NOT EXISTS reservations (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      \"resourceId\" UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,\n      \"userId\" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n      \"startTime\" TIMESTAMP WITH TIME ZONE NOT NULL,\n      \"endTime\" TIMESTAMP WITH TIME ZONE NOT NULL,\n      status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',\n      \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n      UNIQUE(\"resourceId\", \"startTime\", \"endTime\")\n    );\n  ";
                    return [4 /*yield*/, executeQuery(client, query)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
