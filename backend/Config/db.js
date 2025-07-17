// import fs from 'fs';
// import pg from 'pg';
// import dotenv from 'dotenv';
// dotenv.config();

// const config = {
//     user: process.env.PG_USER,
//     password: process.env.PG_PASSWORD,
//     host: process.env.PG_HOST,
//     port: process.env.PG_PORT,
//     database: process.env.PG_DATABASE,
//     ssl: {
//         rejectUnauthorized: true,
//         ca: (() => {
//             try {
//                 return fs.readFileSync(process.env.PG_SSL_CERT).toString();
//             } catch (err) {
//                 console.error("Error reading 'ca.pem':", err.message);
//                 process.exit(1); // Exit the process if the file is missing
//             }
//         })(),
//     },
// };

// const client = new pg.Client(config);  

// const checkDBConnection = async () => {
//     try {
//         await client.connect();
//         const result = await client.query("SELECT NOW()");
//         console.log("Database connected successfully at:", result.rows[0].now);
//     } catch (err) {
//         console.error("Database connection failed:", err);
//     } finally {
//         await client.end();
//     }
// };

// checkDBConnection();

// export default client;