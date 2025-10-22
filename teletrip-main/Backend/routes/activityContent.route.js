const express = require('express');
const router = express.Router();
const activityContentController = require('../controllers/activityContent.controller');

router.get('/activities/:language/:activityCode/:modalityCode?', activityContentController.getActivityContentSimple);
router.post('/activities', activityContentController.getActivityContentMulti);
router.get('/countries/:language?', activityContentController.getCountries);
router.get('/destinations/:language/:countryCode', activityContentController.getDestinations);
router.get('/currencies/:language?', activityContentController.getCurrencies);
router.get('/languages', activityContentController.getLanguages);
router.get('/segments/:language?', activityContentController.getSegments);

module.exports = router;
