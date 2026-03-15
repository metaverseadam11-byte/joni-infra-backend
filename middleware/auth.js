/**
 * Authentication Middleware
 * 
 * API key validation for all requests
 */

export function requireAuth(validApiKeys) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing Authorization header'
      });
    }
    
    // Expected format: "Bearer YOUR_API_KEY"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid Authorization header format. Use: Bearer YOUR_API_KEY'
      });
    }
    
    const apiKey = parts[1];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // API key is valid
    next();
  };
}

export function optionalAuth(validApiKeys) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.authenticated = false;
      return next();
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const apiKey = parts[1];
      req.authenticated = validApiKeys.includes(apiKey);
    } else {
      req.authenticated = false;
    }
    
    next();
  };
}
