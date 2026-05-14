const responseFormatter = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        // Avoid double formatting
        if (data && typeof data === 'object' && ('success' in data) && ('data' in data || 'message' in data)) {
            return originalJson.call(this, data);
        }

        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        let message = isSuccess ? 'Success' : 'Error';
        let payload = data;

        if (data && typeof data === 'object') {
            const newData = { ...data };
            if (newData.msg) {
                message = newData.msg;
                delete newData.msg;
            }
            if (newData.message) {
                message = newData.message;
                delete newData.message;
            }
            if (newData.error && newData.error.message) {
                message = newData.error.message;
                delete newData.error.message;
            }
            // Cleanup empty objects
            if (newData.error && Object.keys(newData.error).length === 0) {
                delete newData.error;
            }
            
            if (Object.keys(newData).length === 0) {
                payload = null;
            } else {
                payload = newData;
            }
        }

        const formattedResponse = {
            success: isSuccess,
            data: payload,
            message: message
        };

        return originalJson.call(this, formattedResponse);
    };
    next();
};

module.exports = responseFormatter;
