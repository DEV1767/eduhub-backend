// Response formatter middleware to sanitize API responses


const sanitizeData = (data) => {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    // Handle objects
    if (typeof data === 'object' && data.toObject) {
        data = data.toObject();
    }

    if (typeof data === 'object') {
        const { __v, password, refreshToken, createdBy, registeredBy, ...sanitized } = data;
        return sanitized;
    }

    return data;
};


export const responseFormatterMiddleware = (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override the json method
    res.json = function(data) {
        // Only format successful responses (200-299)
        if (res.statusCode >= 200 && res.statusCode < 300 && data) {
            // Clone the data to avoid modifying the original
            const response = JSON.parse(JSON.stringify(data));

            // Sanitize different response structures
            if (response.user) {
                response.user = sanitizeData(response.user);
            }
            if (response.event) {
                response.event = sanitizeData(response.event);
            }
            if (response.events) {
                response.events = sanitizeData(response.events);
            }
            if (response.schedule) {
                response.schedule = sanitizeData(response.schedule);
            }
            if (response.teams) {
                response.teams = sanitizeData(response.teams);
            }
            if (response.myregistration) {
                response.myregistration = sanitizeData(response.myregistration);
            }
            if (response.registration) {
                response.registration = sanitizeData(response.registration);
            }
            if (response.registrations) {
                response.registrations = sanitizeData(response.registrations);
            }
            if (response.slot) {
                response.slot = sanitizeData(response.slot);
            }
            if (response.info) {
                response.info = sanitizeData(response.info);
            }

            return originalJson.call(this, response);
        }

    // For error responses or other cases, return as-is
        return originalJson.call(this, data);
    };

    next();
};
