const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "crm_db",
    multipleStatements: true,
};


async function runSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const connection = await mysql.createConnection(config);

  try {
    await connection.query(schema);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await connection.end();
  }
}

async function insertDummyData() {
    const dataPath = path.join(__dirname, 'dummy_data.sql');
    const data = fs.readFileSync(dataPath, 'utf8');

    const connection = await mysql.createConnection(config);
        try {
            await connection.query(data);
            console.log('Dummy data inserted successfully!');
        } catch (err) {
            console.error('Error inserting dummy data:', err);
        }
        finally {
            await connection.end();
        }
}

runSchema();
insertDummyData();