import axios from "axios";
import express from 'express'
import cors from 'cors'
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ruralgrow-xs66.onrender.com'] // Replace with your actual Render domain
    : ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

const port = process.env.PORT || 5000;

const baseUrl = "https://www.india.gov.in/schemes-women-department-women-and-child-development?page=";

async function scrapeAllPages() {
    const allSchemes = [];
  
    for (let i = 0; i <= 5; i++) {
      try {
        const { data } = await axios.get(`${baseUrl}${i}`);
        const $ = cheerio.load(data);
    
        $(".views-row").each((_, el) => {
          const name = $(el).find("h3 a").text().trim();
          const description = $(el).find(".field-content p").text().trim();
          let link = $(el).find("h3 a").attr("href") || '';
          link = link.trim();
    
          if (!link.startsWith('http')) {
            link = "https://www.india.gov.in" + link;
          }
    
          allSchemes.push({ name, description, link });
        });
      } catch (error) {
        console.error(`Error scraping page ${i}:`, error.message);
      }
    }
  console.log("56: ", JSON.stringify(allSchemes, null, 2));
  
    return JSON.stringify(allSchemes, null, 2);
}

app.get('/api/getSchemes', async(req, res) => {
    try {
        const schems = await scrapeAllPages();
        res.json(JSON.parse(schems));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Catch-all route to serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});