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
var serverless_1 = require("@neondatabase/serverless");
var schema_1 = require("../lib/schema");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pool, client, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = new serverless_1.Pool({ connectionString: process.env.DATABASE_URL });
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, 10, 12]);
                    console.log('Creating tables...');
                    return [4 /*yield*/, (0, schema_1.createUsersTable)(client)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, schema_1.createResourcesTable)(client)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, schema_1.createReservationsTable)(client)];
                case 5:
                    _a.sent();
                    console.log('Tables created successfully.');
                    console.log('Seeding users...');
                    return [4 /*yield*/, client.query("\n      INSERT INTO users (id, name, email, role)\n      VALUES\n        ('410544b2-4001-4271-9855-fec4b6a6442a', 'Admin User', 'admin@example.com', 'Admin'),\n        ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Regular User', 'user@example.com', 'User')\n      ON CONFLICT (email) DO NOTHING;\n    ")];
                case 6:
                    _a.sent();
                    console.log('Seeding resources...');
                    return [4 /*yield*/, client.query("\n      INSERT INTO resources (id, name, type, location, capacity, equipment, \"imageUrl\", tags)\n      VALUES\n        ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sala de Reuni\u00E3o 1', 'Sala', 'Bloco A', 10, '{\"Projetor\", \"Quadro Branco\"}', 'https://via.placeholder.com/150', '{\"reuniao\", \"apresentacao\"}'),\n        ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Projetor Epson', 'Equipamento', 'Sala de TI', 1, '{\"Cabo HDMI\", \"Cabo VGA\"}', 'https://via.placeholder.com/150', '{\"projetor\", \"apresentacao\"}')\n      ON CONFLICT (id) DO NOTHING;\n    ")];
                case 7:
                    _a.sent();
                    console.log('Seeding reservations...');
                    return [4 /*yield*/, client.query("\n      INSERT INTO reservations (id, \"resourceId\", \"userId\", \"startTime\", \"endTime\")\n      VALUES\n        ('a56e1573-2169-4b69-8692-23c6d8d672a6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '410544b2-4001-4271-9855-fec4b6a6442a', '2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')\n      ON CONFLICT (id) DO NOTHING;\n    ")];
                case 8:
                    _a.sent();
                    console.log('Database seeded successfully.');
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error seeding database:', error_1);
                    throw error_1;
                case 10:
                    client.release();
                    return [4 /*yield*/, pool.end()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('An error occurred while attempting to seed the database:', err);
});
