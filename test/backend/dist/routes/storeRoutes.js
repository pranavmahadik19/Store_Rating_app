"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
// Apply normal user protection to all store rating routes
router.use(auth_1.authenticate);
router.use((0, auth_1.requireRole)(['NORMAL']));
router.get('/', storeController_1.getStores);
router.post('/:storeId/rate', (0, validate_1.validateBody)(schemas_1.ratingSchema), storeController_1.submitRating);
exports.default = router;
