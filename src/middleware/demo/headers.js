/**
 * Middleware to add custom headers for demo purposes.
 */
const addDemoHeaders = (req, res, next) => {
    // Add a header called 'X-Demo-Page' with value 'true'
    res.setHeader('X-Demo-Page', 'true');

    // Add a header called 'X-Middleware-Demo' with any message you want
    res.setHeader('X-Middleware-Demo', 'This is a middleware demo header');

    next();
};

export { addDemoHeaders };