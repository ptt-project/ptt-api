const { Client } = module.require('pg');
const adminCred = {
  user: process.env.DB_ADMIN_USERNAME,
  password: process.env.DB_ADMIN_PASSWORD,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
};

async function dropDb(config) {
  const client = new Client(Object.assign({}, adminCred));
  await client.connect();
  const result = await client.query(
    `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${config.database}');`,
  );
  if (result.rowCount > 0) {
    await client.query(`DROP DATABASE ${config.database};`);
    await client.query(`DROP ROLE IF EXISTS ${config.user};`);
    console.log(`drop ${config.database}`);
  } else {
    console.log(`${config.database} db not exist`);
  }
  await client.end();
}
const defaultDbCred = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
async function createAllDb() {
  await dropDb(defaultDbCred);
  await dropDb({ ...defaultDbCred, database: process.env.DB_TEST_NAME });
}
createAllDb();
