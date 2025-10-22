const activityContentService = require('../services/activityContent.service');
const ApiResponse = require('../utils/response.util');

exports.getActivityContentSimple = async (req, res) => {
  try {
    const { language, activityCode, modalityCode } = req.params;
    const data = await activityContentService.getActivityContentSimple(language, activityCode, modalityCode);
    return ApiResponse.success(res, data, 'Activity content retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getActivityContentMulti = async (req, res) => {
  try {
    const { language, activityCodes } = req.body;
    const data = await activityContentService.getActivityContentMulti(language, activityCodes);
    return ApiResponse.success(res, data, 'Activity contents retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getCountries = async (req, res) => {
  try {
    const { language = 'en' } = req.params;
    const data = await activityContentService.getCountries(language);
    return ApiResponse.success(res, data, 'Countries retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const { language, countryCode } = req.params;
    const data = await activityContentService.getDestinations(language, countryCode);
    return ApiResponse.success(res, data, 'Destinations retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getCurrencies = async (req, res) => {
  try {
    const { language = 'en' } = req.params;
    const data = await activityContentService.getCurrencies(language);
    return ApiResponse.success(res, data, 'Currencies retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getLanguages = async (req, res) => {
  try {
    const data = await activityContentService.getLanguages();
    return ApiResponse.success(res, data, 'Languages retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.getSegments = async (req, res) => {
  try {
    const { language = 'en' } = req.params;
    const data = await activityContentService.getSegments(language);
    return ApiResponse.success(res, data, 'Segments retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};
