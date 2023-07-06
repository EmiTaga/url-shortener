const express = require('express');
const app = express();
const port = 3000;
const XlsxPopulate = require('xlsx-populate');
const qr = require('qr-image');
// Additional required modules
const csv = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql');
const ExcelJS = require('exceljs');
let indexRouter = require('./routes/index');
let uploadRouter = require('./routes/upload');
let loginRouter = require('./routes/login');
let expressSession = require('express-session');
let cookieParser = require('cookie-parser');
let path = require('path');
// Set EJS as the templating engine
const pool = mysql.createPool({
    host: 'localhost', // Replace with your host name
    user: 'root',      // Replace with your database username
    password: 'Avalon.32',      // Replace with your database password
    database: 'url_shortener' // // Replace with your database Name
  });
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(expressSession({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/upload', uploadRouter);
app.use('/login', loginRouter);
// Object to store the mappings of shortened URLs to original URLs

// Home route
// app.get('/', (req, res) => {
//   res.render('index', { shortUrl: null, csvUrls: [] }); // Pass shortUrl as null and empty csvUrls array initially
// });

// // Shorten URL route
// app.post('/shorten', (req, res) => {
//     const longUrl = req.body.longUrl;
  
//     // Check if a CSV file was uploaded
//     if (req.files && req.files.csv) {
//       const csvFile = req.files.csv;
  
//       // Read the CSV file
//       fs.createReadStream(csvFile.tempFilePath)
//         .pipe(csv())
//         .on('data', (row) => {
//           const longUrl = row.url;
//           const shortId = generateShortId(); // Generate a random alphanumeric string
  
//           // Store the mapping of the shortened URL to the original URL in the database
//           const sql = 'INSERT INTO urls (long_url, short_url) VALUES (?, ?)';
//           const values = [longUrl, shortId];
  
//           pool.query(sql, values, (error, results) => {
//             if (error) {
//               console.error('Error inserting data into database:', error);
//               return;
//             }
//           });
//         })
//         .on('end', () => {
//           // Redirect back to the homepage after processing the CSV file
//           res.redirect('/');
//         });
//     } else {
//       // Generate a short ID and short URL
//       const shortId = generateShortId();
//       const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
  
//       // Insert the URL and its shortened version into the database
//       const sql = 'INSERT INTO urls (long_url, short_url) VALUES (?, ?)';
//       const values = [longUrl, shortUrl];
  
//       pool.query(sql, values, (error, results) => {
//         if (error) {
//           console.error('Error inserting data into database:', error);
//           return res.status(500).send('Error inserting data into database');
//         }
  
//         // Get the array of shortened URLs from the database
//         const getUrlsSql = 'SELECT long_url, short_url FROM urls';
//         pool.query(getUrlsSql, (error, urlResults) => {
//           if (error) {
//             console.error('Error fetching data from database:', error);
//             return res.status(500).send('Error fetching data from database');
//           }
  
//           const csvUrls = urlResults.map((row) => ({
//             longUrl: row.long_url,
//             shortUrl: row.short_url
//           }));
  
//           // Render the index page with the shortened URL and the urls array
//           res.render('index', { shortUrl, csvUrls });
//         });
//       });
//     }
//   });
// // Upload CSV route
// // Upload CSV route
// app.post('/upload', (req, res) => {
//     if (!req.files || !req.files.csv) {
//       return res.status(400).send('No CSV file uploaded.');
//     }
  
//     const csvFile = req.files.csv;
  
//     // Read the CSV file
//     fs.createReadStream(csvFile.tempFilePath)
//       .pipe(csv())
//       .on('data', (row) => {
//         const longUrl = row.url;
//         const shortId = generateShortId(); // Generate a random alphanumeric string
  
//         // Store the mapping of the shortened URL to the original URL
//         urlDatabase[shortId] = longUrl;
//       })
//       .on('end', () => {
//         // Redirect back to the homepage after processing the CSV file
//         res.redirect('/');
//       });
//   });
  
  
//   app.get('/download-excel', async (req, res) => {
//     try {
//       // Create a new workbook
//       const workbook = new ExcelJS.Workbook();
//       const sheet = workbook.addWorksheet('URLs');
  
//       // Set up the headers
//       sheet.getRow(1).values = ['Original URL', 'Shortened URL', 'QR Code'];
  
//       // Get the URLs from the CSV file or any other source
//       const csvUrls = [
//         { longUrl: 'https://example.com', shortUrl: 'https://short.com/abc' },
//         { longUrl: 'https://google.com', shortUrl: 'https://short.com/xyz' }
//       ];
  
//       // Iterate over the URLs and add data to the sheet
//       csvUrls.forEach((url, index) => {
//         const row = sheet.getRow(index + 2);
//         row.getCell(1).value = url.longUrl;
//         row.getCell(2).value = url.shortUrl;
  
//         // Generate QR code image
//         const qrCodeBuffer = qr.imageSync(url.shortUrl, { type: 'png' });
//         const qrCodeImage = workbook.addImage({
//           buffer: qrCodeBuffer,
//           extension: 'png'
//         });
//         row.getCell(3).fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFFFFFFF' },
//           bgColor: { argb: 'FFFFFFFF' },
//           backgroundImageId: qrCodeImage.imageId,
//           patternFGColor: { argb: 'FFFFFFFF' },
//           patternBGColor: { argb: 'FFFFFFFF' }
//         };
//       });
  
//       // Set up the response headers
//       res.setHeader('Content-Disposition', 'attachment; filename=urls.xlsx');
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
//       // Write the workbook to the response
//       await workbook.xlsx.write(res);
//       res.end();
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   });
  
// // Redirect from shortened URL to original URL
// app.get('/:shortId', (req, res) => {
//   const shortId = req.params.shortId;
//   const longUrl = urlDatabase[shortId];

//   if (longUrl) {
//     res.redirect(longUrl);
//   } else {
//     res.status(404).send('Shortened URL not found');
//   }
// });

// // Function to generate a random alphanumeric string
// function generateShortId() {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let shortId = '';
//   const length = 6; // Length of the shortened URL

//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     shortId += characters[randomIndex];
//   }

//   return shortId;
// }

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
