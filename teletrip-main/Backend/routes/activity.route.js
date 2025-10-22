const express = require('express');
const router = express.Router();
const activitiesService = require('../services/activities.service');
const activityContentService = require('../services/activityContent.service');
const { cacheMiddleware } = require('../utils/cache');

// Search activities with validation
router.post('/search', async (req, res) => {
  try {
    const { destination, country, from, to, paxes = [{ age: 30 }], language = 'en', pagination } = req.body;

    // Validation
    if (!destination || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, from, to'
      });
    }

    // Date validation
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }
    if (toDate <= fromDate) {
      return res.status(400).json({ success: false, error: 'to date must be after from date' });
    }

    // Paxes validation
    if (!Array.isArray(paxes) || paxes.length === 0) {
      return res.status(400).json({ success: false, error: 'paxes must be a non-empty array' });
    }

    // Get coordinates using geocoding (same as hotels)
    const fetch = (await import('node-fetch')).default;
    const geocodeUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/geocode?q=${encodeURIComponent(destination + (country ? ', ' + country : ''))}`;
    const geoResponse = await fetch(geocodeUrl);
    
    if (!geoResponse.ok) {
      throw new Error('Failed to get location coordinates');
    }

    const geoData = await geoResponse.json();
    const { lat, lon } = geoData?.data?.[0] || {};
    
    if (!lat || !lon) {
      throw new Error('Invalid location coordinates');
    }

    const result = await activitiesService.searchActivities({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      from,
      to,
      paxes,
      language,
      pagination
    });

    console.log('Search result sample:', JSON.stringify(result.activities?.[0], null, 2));

    // Debug: Log first activity structure
    if (result.activities && result.activities.length > 0) {
      console.log('Sample activity structure:', JSON.stringify(result.activities[0], null, 2));
    }
    
    const activities = await Promise.all((result.activities || []).map(async (activity) => {
      let images = [];
      let contentDescription = activity.content?.description || '';
      let summary = null;
      let activityType = activity.content?.activityFactsheetType;

      try {
        const contentData = await activityContentService.getActivityContentSimple(language, activity.code);
        const content = contentData?.activitiesContent?.[0];
        
        if (content?.media?.images) {
          images = content.media.images
            .flatMap(img => img.urls?.map(u => u.resource) || [])
            .filter(Boolean)
            .slice(0, 5);
        }
        
        if (content?.description) contentDescription = content.description;
        if (content?.summary) summary = content.summary;
        if (content?.activityFactsheetType) activityType = content.activityFactsheetType;
      } catch (err) {
        // Content API not available for this activity - use search data
      }

      let pricing = { amount: null, currency: 'EUR' };
      
      // Try amountsFrom first
      if (activity.amountsFrom?.length > 0) {
        const lowestPrice = activity.amountsFrom.reduce((min, curr) => 
          parseFloat(curr.amount || 0) < parseFloat(min.amount || Infinity) ? curr : min
        );
        if (lowestPrice.amount) {
          pricing = { amount: lowestPrice.amount, currency: lowestPrice.currency || 'EUR' };
        }
      }
      
      // Fallback to modalities pricing
      if (!pricing.amount && activity.modalities?.length > 0) {
        for (const modality of activity.modalities) {
          if (modality.amountsFrom?.length > 0) {
            const price = modality.amountsFrom[0];
            pricing = { amount: price.amount, currency: price.currency || 'EUR' };
            break;
          }
          if (modality.rates?.length > 0) {
            const rate = modality.rates[0];
            pricing = { amount: rate.totalAmount?.amount, currency: rate.totalAmount?.currency || 'EUR' };
            break;
          }
        }
      }

      return {
        code: activity.code,
        name: activity.name,
        description: contentDescription,
        summary,
        images: images.length > 0 ? images : ['https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'],
        pricing,
        country: activity.country?.name || country,
        destination: activity.destination?.name || destination,
        activityFactsheetType: activityType
      };
    }));
    
    res.json({ 
      success: true, 
      data: { 
        activities,
        total: result.total || activities.length,
        searchParams: { destination, country, from, to }
      }
    });
  } catch (error) {
    console.error('Activities search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get activity details with caching
router.get('/detail/:activityCode', cacheMiddleware, async (req, res) => {
  try {
    const { activityCode } = req.params;
    const { from, to, language = 'en' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Missing: from, to' });
    }

    const [result, contentData] = await Promise.all([
      activitiesService.getActivityDetails(activityCode, from, to, language).catch(() => null),
      activityContentService.getActivityContentSimple(language, activityCode).catch(() => null)
    ]);

    if (!result && !contentData) {
      return res.status(404).json({ success: false, error: 'Activity not available for selected dates' });
    }

    if (!result) {
      const content = contentData?.activitiesContent?.[0] || {};
      return res.json({
        success: true,
        data: {
          code: activityCode,
          name: content.name || 'Activity',
          description: content.description || '',
          summary: content.summary,
          activityFactsheetType: content.activityFactsheetType,
          highlights: content.highligths,
          detailedInfo: content.detailedInfo,
          fullDescription: (content.featureGroups || []).map(g => ({
            title: g.groupCode,
            included: (g.included || []).map(f => f.description),
            excluded: (g.excluded || []).map(f => f.description)
          })),
          modalities: [],
          images: content.media?.images?.flatMap(img => img.urls?.map(u => u.resource) || []).filter(Boolean) || [],
          location: { startPoints: content.location?.startPoints, endPoints: content.location?.endPoints },
          guidingOptions: content.guidingOptions,
          redeemInfo: content.redeemInfo
        }
      });
    }
    
    const activity = result?.activity || {};
    const content = contentData?.activitiesContent?.[0] || {};
    
    let images = [];
    if (content.media?.images) {
      images = content.media.images
        .flatMap(img => img.urls?.map(u => u.resource) || [])
        .filter(Boolean);
    }
    if (images.length === 0) images = ['https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'];

    const structured = {
      code: activity.code,
      name: content.name || activity.name,
      description: content.description || '',
      summary: content.summary,
      activityFactsheetType: content.activityFactsheetType,
      highlights: content.highligths,
      detailedInfo: content.detailedInfo,
      
      fullDescription: (content.featureGroups || []).map(g => ({
        title: g.groupCode,
        included: (g.included || []).map(f => f.description),
        excluded: (g.excluded || []).map(f => f.description)
      })).filter(g => g.included.length > 0 || g.excluded.length > 0),
      
      // Modalities with rates
      modalities: (activity.modalities || []).length > 0 ? (activity.modalities || []).map(m => {
        // Get pricing from amountsFrom or rates
        let pricing = [];
        if (m.amountsFrom && Array.isArray(m.amountsFrom)) {
          pricing = m.amountsFrom.map(a => ({
            amount: a.amount,
            currency: a.currency || 'EUR',
            paxType: a.paxType
          }));
        } else if (m.rates && Array.isArray(m.rates)) {
          pricing = m.rates.map(r => ({
            rateKey: r.rateKey,
            amount: r.totalAmount?.amount,
            currency: r.totalAmount?.currency || 'EUR'
          }));
        }

        return {
          code: m.code,
          name: m.name,
          duration: m.duration?.value ? `${m.duration.value} ${m.duration.metric}` : null,
          pricing
        };
      }) : content.modalities ? [{
        code: 'default',
        name: 'Standard Option',
        duration: null,
        pricing: [{ amount: null, currency: 'EUR' }]
      }] : [],
      
      duration: content.scheduling?.duration?.hours ? `${content.scheduling.duration.hours} hours` : null,
      scheduling: content.scheduling,
      
      // Cancellation policies
      cancellationPolicies: activity.modalities?.[0]?.amountsFrom?.[0]?.cancellationPolicies || content.cancellationPolicies || [],
      
      location: {
        startPoints: content.location?.startPoints,
        endPoints: content.location?.endPoints
      },
      guidingOptions: content.guidingOptions,
      redeemInfo: content.redeemInfo,
      
      images
    };

    // Set cache headers (1 hour)
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ success: true, data: structured });
  } catch (error) {
    console.error('Activity details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check availability with retry logic
router.post('/availability', async (req, res) => {
  try {
    const { activityCode, modalityCode, from, to, paxes = [{ age: 30 }] } = req.body;

    // Validation
    if (!activityCode || !from || !to) {
      return res.status(400).json({ success: false, error: 'Missing: activityCode, from, to' });
    }

    if (!Array.isArray(paxes) || paxes.length === 0) {
      return res.status(400).json({ success: false, error: 'paxes must be non-empty array' });
    }

    const result = await activitiesService.checkAvailability({
      activityCode,
      modalityCode,
      from,
      to,
      paxes
    });

    // Parse and format response
    const activities = result.activities || [];
    const formatted = activities.map(activity => {
      const modalities = activity.modalities || [];
      
      return {
        activityCode: activity.code,
        name: activity.name,
        availableModalities: modalities.map(modality => ({
          code: modality.code,
          name: modality.name,
          availableDates: modality.operationDates?.map(date => ({
            date: date.from,
            slots: date.sessions?.map(session => ({
              time: session.time,
              available: session.available,
              pricing: {
                total: session.totalAmount?.amount,
                perPerson: session.totalAmount?.amount / paxes.length,
                currency: session.totalAmount?.currency
              }
            })) || []
          })) || [],
          questions: modality.questions || []
        }))
      };
    });

    res.json({ 
      success: true, 
      data: { 
        availability: formatted,
        paxCount: paxes.length 
      }
    });
  } catch (error) {
    console.error('Availability check error:', error);
    
    // Retry on rate limit
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again in a moment.',
        retryAfter: 5
      });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create booking
router.post('/booking', async (req, res) => {
  try {
    const { activityCode, modalityCode, from, to, paxes, holder, clientReference } = req.body;

    if (!activityCode || !modalityCode || !from || !to || !holder) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const data = await activitiesService.createBooking(req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booking
router.get('/booking/:bookingReference', async (req, res) => {
  try {
    const data = await activitiesService.getBooking(req.params.bookingReference);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
