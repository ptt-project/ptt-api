const defaultConfig = {
  name: 'default',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  cli: {
    migrationsDir: 'migration',
  },
  entities: ['dist/db/entities/*{.js,.ts}'],
  migrations: ['dist/db/migrations/*{.js,.ts}'],
  subscribers: ['dist/db/subscriber/**/*{.js,.ts}'],
  autoLoadEntities: true,

  logging: ['error', 'info', 'log', 'warn'],
};

const ORMConfig = {
  ...defaultConfig,
  database: process.env.DB_NAME,
};

module.exports = ORMConfig;
