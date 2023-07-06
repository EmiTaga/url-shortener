const express = require('express');
const app = express();
const ExcelJS = require('exceljs');
const qr = require('qr-image');
const mysql = require('mysql');
const { conn, saveURL, getAllURLs, getLongUrl } = require('../database');

// MySQL connection configuration
app.get('/:shortUrl', async (req, res) => {
    try {
      const shortUrl = req.params.shortUrl;
      
      // Call the getLongUrl function with the shortUrl
      const urlData = await getLongUrl(shortUrl);
  
      console.log('Long URL:', urlData.longUrl);
  
      if (urlData.longUrl) {
        res.redirect(urlData.longUrl);
      } else {
        throw new Error('Shortened URL not found');
      }
    } catch (error) {
      console.error('Error redirecting to long URL:', error);
      res.status(404).send('Shortened URL not found');
    }
  });
  
  
  // The rest of your code...
  ;
  
  app.get('/', async (req, res) => {
    try {
      const urls = await getAllURLs();
      res.render('index', { urls });
    } catch (error) {
      console.error('Error retrieving URLs from the database:', error);
      res.status(500).send('Error retrieving URLs from the database');
    }
  });
  
  app.post('/shorten', async (req, res) => {
    const longUrl = req.body.longUrl;
    const shortId = generateShortId(); // Generate a random alphanumeric string
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
  
    try {
      await saveURL(longUrl, shortUrl);
      res.redirect('/');
    } catch (error) {
      console.error('Error saving URL in the database:', error);
      return res.status(500).send('Error saving URL in the database');
    }
  });
  app.get('/download-excel', async (req, res) => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('URLs');
  
      // Set up the headers
      sheet.getRow(1).values = ['Original URL', 'Shortened URL', 'QR Code'];
  
      // Fetch the URLs from the database
      let csvUrls;
      try {
        csvUrls = await getAllURLs();
      } catch (error) {
        console.error('Error retrieving URLs from the database:', error);
        return res.status(500).send('Error retrieving URLs from the database');
      }
  
      // Iterate over the URLs and add data to the sheet
      csvUrls.forEach((url, index) => {
        const row = sheet.getRow(index + 2);
        row.getCell(1).value = url.long_url;
        row.getCell(2).value = url.short_url;
  
        // Generate QR code image
        const qrCodeBuffer = qr.imageSync(url.short_url, { type: 'png' });
        const qrCodeImage = workbook.addImage({
          buffer: qrCodeBuffer,
          extension: 'png'
        });
        row.getCell(3).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' },
          bgColor: { argb: 'FFFFFFFF' },
          backgroundImageId: qrCodeImage.imageId,
          patternFGColor: { argb: 'FFFFFFFF' },
          patternBGColor: { argb: 'FFFFFFFF' }
        };
      });
  
      // Set up the response headers
      res.setHeader('Content-Disposition', 'attachment; filename=urls.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  function generateShortId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortId = '';
    const length = 6; // Length of the shortened URL
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      shortId += characters[randomIndex];
    }
  
    return shortId;
  }
  
  
  // Save URL function
//   const saveURL = async (longUrl, shortUrl) => {
//     try {
//       const query = 'INSERT INTO links (long_url, short_url) VALUES (?, ?)';
//       await conn.promise().execute(query, [longUrl, shortUrl]);
//     } catch (error) {
//       console.error('Error saving URL in the database:', error);
//       throw error;
//     }
//   };
  
  // Retrieve all URLs from the database
//   const getAllURLs = async () => {
//     try {
//       const query = 'SELECT long_url, short_url FROM links';
//       const [rows] = await conn.promise().query(query);
//       return rows;
//     } catch (error) {
//       console.error('Error retrieving URLs from the database:', error);
//       throw error;
//     }
//   };
  
  // Generate a random alphanumeric string
//   const generateShortId = () => {
//     // Logic to generate the short ID
//     // ...
//   };
  
  
//   app.get('/:shortId', async (req, res) => {
//     const shortId = req.params.shortId;
  
//     // Retrieve the long URL associated with the provided short ID from the database
//     try {
//       const longUrl = await getLongUrl(shortId);
  
//       if (longUrl) {
//         // Redirect the user to the original long URL
//         res.redirect(longUrl);
//       } else {
//         console.log('Shortened URL not found:', shortId);
//         res.status(404).send('Shortened URL not found');
//       }
//     } catch (error) {
//       console.error('Error retrieving long URL from the database:', error);
//       res.status(500).send('Error retrieving long URL from the database');
//     }
//   });
//   app.get('/:shortId', (req, res) => {
//     const shortId = req.params.shortId;
  
//     // Retrieve the long URL associated with the provided short ID from the database
//     const query = 'SELECT long_url FROM links WHERE short_url = ?';
//     conn.query(query, [shortId], (error, results) => {
//       if (error) {
//         console.error('Error retrieving long URL from the database:', error);
//         return res.status(500).send('Error retrieving long URL from the database');
//       }
  
//       console.log('Results:', results); // Check the results in the console
  
//       if (results.length === 0) {
//         // No long URL found for the provided short ID
//         console.log('Shortened URL not found:', shortId); // Log the short ID for debugging
//         return res.status(404).send('Shortened URL not found');
//       }
  
//       const longUrl = results[0].long_url;
  
//       // Redirect the user to the original long URL
//       res.redirect(longUrl);
//     });
//   });
  

  // app.get('/:shortId', (req, res) => {
//   const shortId = req.params.shortId;
//   const longUrl = db[shortId];

//   if (longUrl) {
//     res.redirect(longUrl);
//   } else {
//     res.status(404).send('Shortened URL not found');
//   }
// });
// Function to save URLs to MySQL database
// function saveUrlsToMySQL(urls) {
//   return new Promise((resolve, reject) => {
//     // Get a connection from the pool
//     pool.getConnection((err, connection) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       // Prepare the query
//       const query = 'INSERT INTO url_shortener.links (long_url, short_url) VALUES ?';

//       // Transform URLs into a 2D array for bulk insert
//       const values = urls.map(url => [url.longUrl, url.shortUrl]);

//       // Execute the query
//       connection.query(query, [values], (err, results) => {
//         connection.release();

//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   });
// }
// app.get('/:shortenurl', (req, res) => {
//     const shortenurl = req.params.shortenurl;
  
//     // Retrieve the long URL associated with the provided shorten URL from the database
//     const query = 'SELECT long_url FROM links WHERE short_url = ?';
//     db.query(query, [shortenurl], (error, results) => {
//       if (error) {
//         console.error('Error retrieving long URL from the database:', error);
//         return res.status(500).send('Error retrieving long URL from the database');
//       }
  
//       if (results.length === 0) {
//         // No long URL found for the provided shorten URL
//         return res.status(404).send('Shorten URL not found');
//       }
  
//       const longUrl = results[0].long_url;
  
//       // Redirect the user to the original long URL
//       res.redirect(longUrl);
//     });
//   });
  

// Function to generate a random alphanumeric string

// const multer = require('multer');

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads'); // Set the destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original filename
//   },
// });

// // Create multer upload instance
// const upload = multer({ storage: storage });
// app.post('/upload', upload.single('csv'), (req, res) => {
//   if (!req.files || !req.files.csv) {
//     return res.status(400).send('No CSV file uploaded.');
//   }

//   const csvFile = req.files.csv;

//   const results = []; // Array to store the CSV data with shortened links

//   fs.createReadStream(csvFile.tempFilePath)
//     .pipe(csv())
//     .on('data', (row) => {
//       const longUrl = row.url;
//       const shortUrl = generateShortId(); // Generate a random alphanumeric string as the shortened URL

//       // Add the original URL and the shortened URL to the results array
//       results.push({ originalUrl: longUrl, shortenedUrl: shortUrl });
//     })
//     .on('end', () => {
//       // Create a new CSV file with the results array
//       const csvData = results.map((row) => `${row.originalUrl},${row.shortenedUrl}`).join('\n');
//       const fileName = `shortened_urls_${Date.now()}.csv`;

//       fs.writeFile(fileName, csvData, (err) => {
//         if (err) {
//           console.error('Error creating CSV file:', err);
//           return res.status(500).send('Error creating CSV file.');
//         }

//         // Provide the CSV file as a download response
//         res.download(fileName, (err) => {
//           if (err) {
//             console.error('Error downloading CSV file:', err);
//           }

//           // Delete the temporary CSV file
//           fs.unlink(fileName, (err) => {
//             if (err) {
//               console.error('Error deleting CSV file:', err);
//             }
//           });
//         });
//       });
//     });
// });
module.exports = app;