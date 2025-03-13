const ENV = {
  development: {
    DATABASE_URL: "postgresql://bookbride:mysecretpassword@localhost:5432/bookbride?schema=public",
    API_URL: "http://10.0.2.2:3000", // Android Emulator
    // API_URL: "http://localhost:3000", // iOS Simulator
    APP_SECRET: "your-super-secret-key-here"
  },
  production: {
    DATABASE_URL: process.env.DATABASE_URL || "",
    API_URL: process.env.API_URL || "",
    APP_SECRET: process.env.APP_SECRET || ""
  },
  test: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test_db?schema=public",
    API_URL: "http://localhost:3000",
    APP_SECRET: "test-secret-key"
  }
};

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
  if (env === 'production') {
    return ENV.production;
  } else if (env === 'test') {
    return ENV.test;
  }
  return ENV.development;
};

export default getEnvVars; 