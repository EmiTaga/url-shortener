const express = require('express');
const app = express();
const ExcelJS = require('exceljs');
const qr = require('qr-image');
const mysql = require('mysql');
// let db=require('../database');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { conn, saveURL, getAllURLs, getLongUrl } = require('../database');

app.get('/upload', (req, res) => {
  res.render('upload', { csvUrls: [] }); // Pass an empty csvUrls array initially
});

app.post('/upload', upload.single('csv'), (req, res) => {
    if (!req.file || !req.file.path) {
      return res.status(400).send('No CSV file uploaded.');
    
    }
  
    const csvFilePath = req.file.path;
    const links = []; // Array to store the links from the CSV file
  
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const longUrl = row.long_url; // Update 'url' to the correct column name
        console.log('Long URL:', longUrl);
       // Check the value of longUrl
      
        const shortUrl = generateShortId(); // Generate a shortened URL
        console.log('Short URL:', shortUrl)
        
        // Generate a shortened URL
  
        // Construct the complete shortened URL with the protocol
        const completeShortUrl = `${req.protocol}://${req.get('host')}/${shortUrl}`;
  
        // Add the long URL and the complete shortened URL to the array
        links.push({ longUrl, shortUrl: completeShortUrl });
  
        // Save the URLs in the database
        const query = 'INSERT INTO csv (long_url, short_url) VALUES (?, ?)';
        const values = [longUrl, completeShortUrl];
  
        conn.query(query, values, (error, results) => {
          if (error) {
            console.error('Error saving URLs in the database:', error);
          }
        });
      })
      .on('end', () => {
        // Render the EJS template with the links array
        res.render('upload', { csvUrls: links });
      });
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
  module.exports = app;
  