const transferLocations = require('../data/transferLocations.json');

exports.getTransferLocations = async (req, res) => {
  try {
    const { search, type } = req.query;
    
    let filteredLocations = transferLocations;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLocations = transferLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchLower) ||
        loc.city.toLowerCase().includes(searchLower) ||
        loc.code.toLowerCase().includes(searchLower) ||
        loc.country.toLowerCase().includes(searchLower)
      );
    }
    
    if (type) {
      filteredLocations = filteredLocations.filter(loc => loc.type === type);
    }
    
    res.json({
      success: true,
      data: filteredLocations,
      total: filteredLocations.length
    });
  } catch (error) {
    console.error('Error fetching transfer locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transfer locations',
      error: error.message
    });
  }
};
