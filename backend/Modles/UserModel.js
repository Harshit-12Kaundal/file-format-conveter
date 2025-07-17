// Import the database pool from your configuration
import pool from '../Config/db';

// Function to create a new user in the database
const createUser = async (username, email, hashedPassword) => {
    const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
    );
    return result.rows[0]; // Return the inserted user
};

// Function to find a user by email
const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0]; // Return the user if found, otherwise undefined
};

// Export the functions for use in the registration controller
module.exports = {
    createUser,
    findUserByEmail,
};

