process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://toyxona_user:toyxona_password@localhost:5432/toyxonahub_test?schema=public';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'toyxonahub_test_jwt_access_secret_super_key_2026';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'toyxonahub_test_jwt_refresh_secret_super_key_2026';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.CACHE_TTL_SECONDS = '300';
process.env.OTP_EXPIRES_SECONDS = '300';
process.env.OTP_MAX_ATTEMPTS = '5';

process.env.S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
process.env.S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || 'http://localhost:9000';
process.env.S3_REGION = 'us-east-1';
process.env.S3_BUCKET = 'toyxonahub-images';
process.env.S3_ACCESS_KEY = 'minioadmin';
process.env.S3_SECRET_KEY = 'minioadmin';
process.env.S3_FORCE_PATH_STYLE = 'true';

process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_SECURE = 'false';
process.env.EMAIL_FROM = 'noreply@toyxonahub.uz';
