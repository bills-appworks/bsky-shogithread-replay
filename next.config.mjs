/** @type {import('next').NextConfig} */
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  output: isDev ? undefined : 'export',
  env: {
    APP_VERSION: packageJson.version,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    if (!isDev) {
      config.module.rules.push({
        test: /app\/api\/.*/,
        use: 'ignore-loader',
      });
      return config;
    }
  },
};

export default nextConfig;
