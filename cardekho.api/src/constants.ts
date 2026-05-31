export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Missing email or password',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  EMAIL_REGISTERED: 'Email already registered',
  REGISTRATION_FAILED: 'Registration failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_FAILED: 'Login failed',
  FETCH_CARS_FAILED: 'Failed to fetch cars',
  FETCH_METADATA_FAILED: 'Failed to fetch metadata',
  FILTER_CARS_FAILED: 'Failed to filter cars',
};

export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
};

export const CAR_CRITERIA = {
  RANDOM_SAMPLE_SIZE: 10,
  FILTER_SAMPLE_SIZE: 20,
  CITY_MIN_MILEAGE: 15,
  FAMILY_MIN_SEATS: 5,
  THRILL_MIN_POWER: 100,
  HIGHWAY_MIN_ENGINE: 1200,
  BEGINNER_MAX_AGE: 5,
  BEGINNER_MAX_KM: 60000,
  INTERMEDIATE_MAX_AGE: 10,
  INTERMEDIATE_MAX_KM: 100000,
};