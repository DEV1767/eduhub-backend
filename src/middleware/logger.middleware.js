import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define logs directory and file path
const logsDir = path.join(__dirname, "../../logs");
const logFilePath = path.join(logsDir, "requests.log");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logging middleware
export const requestLogger = (req, res, next) => {
    // Capture start time
    const startTime = Date.now();

    // Get client IP address
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket?.remoteAddress ||
                    "Unknown";

    // Get user ID if authenticated, otherwise "Guest"
    const userId = req.user?._id || "Guest";

    // Override res.send to capture status code and response time
    const originalSend = res.send;
    res.send = function (data) {
        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Get status code
        const statusCode = res.statusCode;

        // Format timestamp
        const timestamp = new Date().toISOString();

        // Create log entry in single-line format
        const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - IP: ${clientIP} - User: ${userId} - ResponseTime: ${responseTime}ms`;

        // Append log to file
        fs.appendFile(logFilePath, logEntry + "\n", (err) => {
            if (err) {
                console.error("Error writing to log file:", err);
            }
        });

        // Call original send
        return originalSend.call(this, data);
    };

    next();
};

// Optional: Alternative middleware using async/await pattern
export const requestLoggerAsync = (req, res, next) => {
    const startTime = Date.now();

    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    "Unknown";

    const userId = req.user?._id || "Guest";

    const originalSend = res.send;
    res.send = function (data) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        const timestamp = new Date().toISOString();

        const logEntry = `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - IP: ${clientIP} - User: ${userId} - ResponseTime: ${responseTime}ms`;

        // Use async file write
        fs.promises.appendFile(logFilePath, logEntry + "\n")
            .catch(err => console.error("Error writing to log file:", err));

        return originalSend.call(this, data);
    };

    next();
};

// Optional: Get all logs
export const getAllLogs = () => {
    try {
        if (fs.existsSync(logFilePath)) {
            return fs.readFileSync(logFilePath, "utf-8");
        }
        return "No logs found";
    } catch (error) {
        console.error("Error reading logs:", error);
        return "Error reading logs";
    }
};

// Optional: Clear logs
export const clearLogs = () => {
    try {
        if (fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, "");
            return "Logs cleared successfully";
        }
        return "No log file to clear";
    } catch (error) {
        console.error("Error clearing logs:", error);
        return "Error clearing logs";
    }
};

// Optional: Get last N logs
export const getLastNLogs = (n = 10) => {
    try {
        if (!fs.existsSync(logFilePath)) {
            return "No logs found";
        }
        const logs = fs.readFileSync(logFilePath, "utf-8").split("\n");
        return logs.slice(-n).filter(log => log.trim() !== "");
    } catch (error) {
        console.error("Error reading logs:", error);
        return "Error reading logs";
    }
};
