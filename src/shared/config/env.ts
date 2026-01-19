/**
 * Environment Configuration
 * 
 * Centralized access to environment variables with type safety
 */

export const env = {
    // App
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_DEV: process.env.NODE_ENV === 'development',
    IS_PROD: process.env.NODE_ENV === 'production',

    // API
    API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    PYTHON_API_URL: process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000',

    // Auth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // Storage (MinIO/S3)
    S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
    S3_BUCKET: process.env.S3_BUCKET || 'mangahub',

    // Imgproxy
    IMGPROXY_URL: process.env.NEXT_PUBLIC_IMGPROXY_URL || 'http://localhost:8080',
    IMGPROXY_KEY: process.env.IMGPROXY_KEY || '',
    IMGPROXY_SALT: process.env.IMGPROXY_SALT || '',

    // OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

    // Payment
    MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || '',
    MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
    MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
    VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
} as const;

/**
 * Validate required environment variables
 * Call this in server startup
 */
export function validateEnv(requiredVars: (keyof typeof env)[]): void {
    const missing = requiredVars.filter(
        (key) => !env[key] || env[key] === ''
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        );
    }
}

export default env;
