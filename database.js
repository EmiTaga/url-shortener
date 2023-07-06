let mysql = require('mysql2');
let conn = mysql.createConnection({
  host: 'localhost', // Replace with your host name
  user: 'root',      // Replace with your database username
  password: 'Avalon.32',      // Replace with your database password
  database: 'url_shortener' // // Replace with your database Name
}); 
 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
const saveURL = async (longUrl, shortUrl) => {
  console.log('Short URL:', shortUrl); // Add this line to log the short URL
  try {
    const query = 'INSERT INTO links (long_url, short_url) VALUES (?, ?)';
    console.log('Long URL:', longUrl);
    await conn.promise().execute(query, [longUrl, shortUrl]);
  } catch (error) {
    console.error('Error saving URL in the database:', error);
    throw error;
  }
};
// const getLongUrl = async (shortUrl) => {
//   try {
//     console.log('Short URL:', shortUrl); // Add this line to log the short URL

//     const query = "SELECT long_url FROM links WHERE short_url = " +shortUrl;
//     const [rows] = await conn.promise().query(query, [shortUrl]);

//     if (rows.length === 0) {
//       return null;
//     }

//     return rows[0].long_url;
//   } catch (error) {
//     console.error('Error retrieving long URL from the database:', error);
//     throw error;
//   }
// };

const getLongUrl = async (shortUrl) => {
  try {
    console.log('Short URL:', shortUrl);

    const query = 'SELECT long_url FROM links WHERE short_url = ? ';
    const [rows] = await conn.promise().query(query, [shortUrl]);

    if (rows.length === 0) {
      return { longUrl: null }; // Return an object with longUrl as null
    }

    const longUrl = rows[0].long_url;
    const shortId = shortUrl; // Set the shortId to the provided shortUrl

    console.log('Short ID:', shortId);

    return { longUrl, shortId }; // Return both longUrl and shortId
  } catch (error) {
    console.error('Error retrieving long URL from the database:', error);
    throw error;
  }
}
;
// Retrieve all URLs from the database
const getAllURLs = async () => {
  try {
    const query = 'SELECT long_url, short_url FROM links ORDER BY id DESC LIMIT 1';

    const [rows] = await conn.promise().query(query);
    return rows;
  } catch (error) {
    console.error('Error retrieving URLs from the database:', error);
    throw error;
  }
};

module.exports = {
  conn,
  saveURL,
  getAllURLs,
  getLongUrl
};