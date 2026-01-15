// Imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';

/**
 * Declare Important Variables
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

/**
 * Setup Express Server
 */
const app = express();
const name = process.env.NAME; 

app.get('/', (req, res) => {
    res.send(`Hello, ${name}!`);
});

/**
 * Configure Express middleware
 */
// Serve static files (CSS, Images) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = 'Welcome Home';
    res.render('home', { title });
});

app.get('/about', (req, res) => {
    const title = 'About Me';
    res.render('about', { title });
});

app.get('/products', (req, res) => {
    const title = 'Our Products';
    res.render('products', { title });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});