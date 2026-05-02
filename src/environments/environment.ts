import { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  envName: 'local',
  authBackend: {
    type: 'supabase',
    url: 'https://irzwqoxltsqtfmsktfmp.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyendxb3hsdHNxdGZtc2t0Zm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUyNzk4NDQsImV4cCI6MTk5MDg1NTg0NH0.NnAlxbZmILyCm1VK09UrG--1IZ4l8_OgqUzuE7O3c80',
  },
  dataBackend: {
    type: 'supabase',
    url: 'https://irzwqoxltsqtfmsktfmp.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyendxb3hsdHNxdGZtc2t0Zm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUyNzk4NDQsImV4cCI6MTk5MDg1NTg0NH0.NnAlxbZmILyCm1VK09UrG--1IZ4l8_OgqUzuE7O3c80',
  },
};
