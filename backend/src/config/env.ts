import 'dotenv/config';

type RequiredEnv =
  | 'PORT'
  | 'CLIENT_ORIGIN'
  | 'AZURE_TENANT_ID'
  | 'AZURE_CLIENT_ID'
  | 'AZURE_CLIENT_SECRET'
  | 'SHAREPOINT_SITE_ID'
  | 'SHAREPOINT_DRIVE_ID'
  | 'SHAREPOINT_LIBRARY_NAME';

const required: RequiredEnv[] = [
  'PORT',
  'CLIENT_ORIGIN',
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_ID',
  'AZURE_CLIENT_SECRET',
  'SHAREPOINT_SITE_ID',
  'SHAREPOINT_DRIVE_ID',
  'SHAREPOINT_LIBRARY_NAME'
];

const allowMock = process.env.NODE_ENV === 'test';

const env = required.reduce<Record<string, string>>((acc, key) => {
  const value = process.env[key];
  if (!value) {
    if (allowMock) {
      acc[key] = `mock-${key.toLowerCase()}`;
      return acc;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  acc[key] = value;
  return acc;
}, {});

export const config = {
  port: Number(env.PORT),
  clientOrigin: env.CLIENT_ORIGIN,
  azure: {
    tenantId: env.AZURE_TENANT_ID,
    clientId: env.AZURE_CLIENT_ID,
    clientSecret: env.AZURE_CLIENT_SECRET
  },
  sharepoint: {
    siteId: env.SHAREPOINT_SITE_ID,
    driveId: env.SHAREPOINT_DRIVE_ID,
    libraryName: env.SHAREPOINT_LIBRARY_NAME
  }
} as const;

