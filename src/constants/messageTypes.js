/**
 * WebSocket message types for client-server communication
 */
const CLIENT_MESSAGE_TYPES = {
    SUBSCRIBE: 'subscribe',    // Subscribe to a livestream chat
    UNSUBSCRIBE: 'unsubscribe', // Unsubscribe from current livestream chat
};

/**
 * WebSocket message types for server-client communication
 */
const SERVER_MESSAGE_TYPES = {
    STATUS: 'status',  // Server status updates (started, subscribed, etc)
    CHAT: 'chat',     // Chat messages from the livestream
    ERROR: 'error',   // Error messages
};

module.exports = {
    CLIENT_MESSAGE_TYPES,
    SERVER_MESSAGE_TYPES
}; 