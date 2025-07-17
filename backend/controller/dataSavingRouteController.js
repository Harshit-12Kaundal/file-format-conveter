// import path from 'path';
// import pool from '../Config/db.js';

// export const saveProfileChanges = async (req, res) => {
//   const { userId, name, age, gender } = req.body;

//   console.log('Received userId:', userId);

//   try {
//     // Check if the user exists
//     const userCheckQuery = `
//       SELECT id FROM users WHERE firebase_uid = $1;
//     `;

//     const userCheckResult = await pool.query(userCheckQuery, [userId]);

//     if (userCheckResult.rows.length === 0) {
//       // User does not exist, create a new one
//       const insertQuery = `
//         INSERT INTO users (firebase_uid, name, age, gender)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *;
//       `;

//       const insertResult = await pool.query(insertQuery, [userId, name, age, gender]);

//       console.log('New user created:', insertResult.rows[0]);

//       res.status(201).send({ message: 'User created successfully!', user: insertResult.rows[0] });
//     } else {
//       // User exists, update the details
//       const updateQuery = `
//         UPDATE users
//         SET name = $1, age = $2, gender = $3, updated_at = CURRENT_TIMESTAMP
//         WHERE firebase_uid = $4
//         RETURNING *;
//       `;

//       const updateResult = await pool.query(updateQuery, [name, age, gender, userId]);

//       console.log('User updated:', updateResult.rows[0]);

//       res.status(200).send({ message: 'Profile updated successfully!', user: updateResult.rows[0] });
//     }
//   } catch (error) {
//     console.error('Error saving profile:', error);
//     res.status(500).send({ message: 'Database error, please try again later.' });
//   }
// };


