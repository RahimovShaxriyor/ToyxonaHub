import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';
import { TASHKENT_DISTRICTS } from '../shared/constants/districts.js';
import { HALL_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '../shared/constants/status.js';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ToyxonaHub API',
    version: '1.0.0',
    description: 'ToyxonaHub - Production-Quality Online Wedding Hall Booking System Backend API',
    contact: {
      name: 'ToyxonaHub Engineering Team',
      email: 'support@toyxonahub.uz',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token in the format: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 45 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
          firstName: { type: 'string', example: 'Anvar' },
          lastName: { type: 'string', example: 'Karimov' },
          email: { type: 'string', format: 'email', example: 'anvar@example.com' },
          username: { type: 'string', example: 'anvar_k' },
          phone: { type: 'string', example: '+998901234567' },
          role: { type: 'string', enum: ['ADMIN', 'OWNER', 'USER'], example: 'USER' },
          emailVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      WeddingHall: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Yulduz Saroyi' },
          district: { type: 'string', enum: TASHKENT_DISTRICTS, example: 'CHILONZOR' },
          address: { type: 'string', example: 'Chilonzor 9-mavze, 45-uy' },
          capacity: { type: 'integer', example: 500 },
          pricePerSeat: { type: 'string', example: '350000.00' },
          phone: { type: 'string', example: '+998712345678' },
          status: { type: 'string', enum: Object.values(HALL_STATUS), example: 'APPROVED' },
          ownerId: { type: 'string', format: 'uuid', nullable: true },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                url: { type: 'string', example: '/uploads/hall1.jpg' },
                isPrimary: { type: 'boolean' },
              },
            },
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          weddingHallId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          bookingDate: { type: 'string', format: 'date', example: '2026-10-15' },
          guestCount: { type: 'integer', example: 350 },
          firstName: { type: 'string', example: 'Dilshod' },
          lastName: { type: 'string', example: 'Rahimov' },
          phone: { type: 'string', example: '+998909876543' },
          hallPrice: { type: 'string', example: '122500000.00' },
          servicesPrice: { type: 'string', example: '15000000.00' },
          totalPrice: { type: 'string', example: '137500000.00' },
          advanceAmount: { type: 'string', example: '27500000.00' },
          status: { type: 'string', enum: Object.values(BOOKING_STATUS), example: 'ACTIVE' },
          timeStatus: { type: 'string', enum: ['UPCOMING', 'PAST'], example: 'UPCOMING' },
          paymentStatus: {
            type: 'string',
            enum: Object.values(PAYMENT_STATUS),
            example: 'PENDING',
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new standard user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'username', 'password', 'phone'],
                properties: {
                  firstName: { type: 'string', example: 'Sardor' },
                  lastName: { type: 'string', example: 'Aliyev' },
                  email: { type: 'string', format: 'email', example: 'sardor@example.com' },
                  username: { type: 'string', example: 'sardor_a' },
                  password: { type: 'string', example: 'Password123' },
                  phone: { type: 'string', example: '+998901234567' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          409: { description: 'Email or username already exists' },
          422: { description: 'Validation failed' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User/Owner/Admin login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['login', 'password'],
                properties: {
                  login: { type: 'string', example: 'sardor@example.com' },
                  password: { type: 'string', example: 'Password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: '6942c730fe359a35e679...' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/auth/send-otp': {
      post: {
        tags: ['Auth', 'OTP'],
        summary: 'Send or resend email OTP verification code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'owner@toyxonahub.uz' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP sent successfully' },
          404: { description: 'User not found' },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth', 'OTP'],
        summary: 'Verify email OTP code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'owner@toyxonahub.uz' },
                  code: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email verified successfully, tokens returned' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current authenticated user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current authenticated user profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
        },
      },
    },
    '/owners': {
      get: {
        tags: ['Owners', 'Admin'],
        summary: 'List owners (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'List of owners returned' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Owners', 'Admin'],
        summary: 'Create a new OWNER user (ADMIN only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'username', 'password', 'phone'],
                properties: {
                  firstName: { type: 'string', example: 'Rustam' },
                  lastName: { type: 'string', example: 'Oripov' },
                  email: { type: 'string', format: 'email', example: 'rustam@toyxonahub.uz' },
                  username: { type: 'string', example: 'rustam_owner' },
                  password: { type: 'string', example: 'OwnerPass123' },
                  phone: { type: 'string', example: '+998911234567' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Owner created successfully' },
          409: { description: 'Duplicate email or username' },
        },
      },
    },
    '/wedding-halls': {
      get: {
        tags: ['Wedding Halls'],
        summary: 'List and search wedding halls with filters and pagination',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Partial case-insensitive name or address search',
          },
          { name: 'district', in: 'query', schema: { type: 'string', enum: TASHKENT_DISTRICTS } },
          { name: 'minCapacity', in: 'query', schema: { type: 'integer' } },
          { name: 'maxCapacity', in: 'query', schema: { type: 'integer' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: Object.values(HALL_STATUS) },
            description: 'ADMIN only',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'capacity', 'pricePerSeat', 'createdAt'] },
          },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Paginated list of wedding halls' },
        },
      },
      post: {
        tags: ['Wedding Halls'],
        summary: 'Create a wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'district', 'address', 'capacity', 'pricePerSeat', 'phone'],
                properties: {
                  name: { type: 'string', example: 'Versal Saroyi' },
                  district: { type: 'string', enum: TASHKENT_DISTRICTS, example: 'YUNUSOBOD' },
                  address: { type: 'string', example: 'Amir Temur ko`chasi, 120' },
                  capacity: { type: 'integer', example: 600 },
                  pricePerSeat: { type: 'number', example: 450000 },
                  phone: { type: 'string', example: '+998712334455' },
                  ownerId: { type: 'string', format: 'uuid', description: 'ADMIN only' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Wedding hall created' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{id}': {
      get: {
        tags: ['Wedding Halls'],
        summary: 'Get wedding hall details with images and services',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Wedding hall details returned' },
          404: { description: 'Wedding hall not found' },
        },
      },
      patch: {
        tags: ['Wedding Halls'],
        summary: 'Update wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  district: { type: 'string', enum: TASHKENT_DISTRICTS },
                  address: { type: 'string' },
                  capacity: { type: 'integer' },
                  pricePerSeat: { type: 'number' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated wedding hall' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Wedding Halls', 'Admin'],
        summary: 'Delete wedding hall (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{id}/status': {
      patch: {
        tags: ['Wedding Halls', 'Admin'],
        summary: 'Approve or Reject wedding hall (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
        },
      },
    },
    '/wedding-halls/{id}/assign-owner': {
      patch: {
        tags: ['Wedding Halls', 'Admin'],
        summary: 'Assign an OWNER to wedding hall (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ownerId'],
                properties: {
                  ownerId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Owner assigned' },
        },
      },
    },
    '/wedding-halls/{id}/availability': {
      get: {
        tags: ['Wedding Halls', 'Calendar'],
        summary: 'Get calendar availability for a given month',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'year', in: 'query', required: true, schema: { type: 'integer', example: 2026 } },
          { name: 'month', in: 'query', required: true, schema: { type: 'integer', example: 10 } },
        ],
        responses: {
          200: {
            description:
              'Array of date statuses (AVAILABLE, BOOKED, PAST). For ADMIN, BOOKED dates include customer details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          date: { type: 'string', example: '2026-10-15' },
                          status: {
                            type: 'string',
                            enum: ['AVAILABLE', 'BOOKED', 'PAST'],
                            example: 'BOOKED',
                          },
                          booking: {
                            type: 'object',
                            nullable: true,
                            description: 'ADMIN only: details of active booking on this date',
                            properties: {
                              bookingId: { type: 'string', format: 'uuid' },
                              firstName: { type: 'string', example: 'Anvar' },
                              lastName: { type: 'string', example: 'Karimov' },
                              customerName: { type: 'string', example: 'Anvar Karimov' },
                              phone: { type: 'string', example: '+998901234567' },
                              guestCount: { type: 'integer', example: 350 },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/wedding-halls/{id}/images': {
      post: {
        tags: ['Wedding Halls', 'Images'],
        summary: 'Upload additional images to wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Up to 10 images (JPEG, PNG, WebP <= 5MB)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Images uploaded successfully' },
          400: { description: 'No files provided or invalid file' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{id}/images/{imageId}': {
      delete: {
        tags: ['Wedding Halls', 'Images'],
        summary: 'Delete image from wedding hall and remove file from disk (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          {
            name: 'imageId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Image deleted successfully' },
          403: { description: 'Forbidden' },
          404: { description: 'Image not found' },
        },
      },
    },
    '/wedding-halls/{id}/images/{imageId}/primary': {
      patch: {
        tags: ['Wedding Halls', 'Images'],
        summary: 'Set image as primary for wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          {
            name: 'imageId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Primary image updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Image not found' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/singers': {
      post: {
        tags: ['Services', 'Singers'],
        summary: 'Add singer to wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', example: 'Ozodbek Nazarbekov' },
                  description: { type: 'string', example: "Xalq artisti, to'liq dastur" },
                  price: { type: 'number', example: 15000000 },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Singer added' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/singers/{singerId}': {
      patch: {
        tags: ['Services', 'Singers'],
        summary: 'Update singer on wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'singerId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Ozodbek Nazarbekov (Jonli ijro)' },
                  description: { type: 'string' },
                  price: { type: 'number', example: 16000000 },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Singer updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Singer not found' },
        },
      },
      delete: {
        tags: ['Services', 'Singers'],
        summary: 'Delete singer from wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'singerId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Singer deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/cars': {
      post: {
        tags: ['Services', 'Cars'],
        summary: 'Add cortege car to wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['model', 'price'],
                properties: {
                  model: { type: 'string', example: 'Mercedes-Benz S-Class W223' },
                  color: { type: 'string', example: 'Oq' },
                  price: { type: 'number', example: 3500000 },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Car added' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/cars/{carId}': {
      patch: {
        tags: ['Services', 'Cars'],
        summary: 'Update cortege car on wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'carId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  model: { type: 'string', example: 'Rolls Royce Phantom' },
                  color: { type: 'string', example: 'Qora' },
                  price: { type: 'number', example: 6000000 },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Car updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Car not found' },
        },
      },
      delete: {
        tags: ['Services', 'Cars'],
        summary: 'Delete cortege car from wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'carId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Car deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/menu': {
      post: {
        tags: ['Services', 'Menu'],
        summary: 'Add menu option to wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'pricePerSeat'],
                properties: {
                  name: { type: 'string', example: 'Premium Lux Menyu' },
                  description: {
                    type: 'string',
                    example: '3 xil issiq taom, 5 xil salat, shirinliklar',
                  },
                  pricePerSeat: { type: 'number', example: 250000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Menu option added' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/menu/{menuId}': {
      patch: {
        tags: ['Services', 'Menu'],
        summary: 'Update menu option on wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'menuId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'VIP Menyu' },
                  description: { type: 'string' },
                  pricePerSeat: { type: 'number', example: 300000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Menu option updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Menu option not found' },
        },
      },
      delete: {
        tags: ['Services', 'Menu'],
        summary: 'Delete menu option from wedding hall (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'menuId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Menu option deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/wedding-halls/{hallId}/services/karnay-surnay': {
      put: {
        tags: ['Services', 'Karnay-Surnay'],
        summary: 'Configure Karnay-Surnay service price and availability (ADMIN or OWNER)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'hallId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isAvailable', 'price'],
                properties: {
                  isAvailable: { type: 'boolean', example: true },
                  price: { type: 'number', example: 1500000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Karnay-Surnay service configured' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a new wedding hall booking (USER only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'weddingHallId',
                  'bookingDate',
                  'guestCount',
                  'firstName',
                  'lastName',
                  'phone',
                ],
                properties: {
                  weddingHallId: { type: 'string', format: 'uuid' },
                  bookingDate: { type: 'string', format: 'date', example: '2026-10-25' },
                  guestCount: { type: 'integer', example: 400 },
                  firstName: { type: 'string', example: 'Jasur' },
                  lastName: { type: 'string', example: 'Karimov' },
                  phone: { type: 'string', example: '+998901112233' },
                  selectedSingerId: { type: 'string', format: 'uuid', nullable: true },
                  selectedCarId: { type: 'string', format: 'uuid', nullable: true },
                  selectedMenuId: { type: 'string', format: 'uuid', nullable: true },
                  includeKarnaySurnay: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking successfully created with calculated 20% advance' },
          400: { description: 'Guest count exceeded or past date' },
          409: {
            description: 'Double booking rejected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'BOOKING_DATE_UNAVAILABLE' },
                    message: {
                      type: 'string',
                      example: 'Wedding hall is already booked for this date',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/bookings/my': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings belonging to current authenticated USER',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: Object.values(BOOKING_STATUS) },
          },
          {
            name: 'timeStatus',
            in: 'query',
            schema: { type: 'string', enum: ['UPCOMING', 'PAST'] },
            description:
              'Filter by UPCOMING or PAST bookingDate relative to Tashkent business date',
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: { description: 'Paginated user bookings with timeStatus' },
        },
      },
    },
    '/bookings/owner': {
      get: {
        tags: ['Bookings', 'Owner'],
        summary: "List bookings for OWNER's wedding hall(s) with isolation",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: Object.values(BOOKING_STATUS) },
          },
          {
            name: 'timeStatus',
            in: 'query',
            schema: { type: 'string', enum: ['UPCOMING', 'PAST'] },
            description: 'Filter by UPCOMING or PAST bookingDate',
          },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          {
            name: 'weddingHallId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter by specific hall owned by this owner',
          },
          {
            name: 'hall',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Alias for weddingHallId',
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: { description: 'Paginated owner hall bookings' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/bookings/admin': {
      get: {
        tags: ['Bookings', 'Admin'],
        summary: 'List all bookings across the platform (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: Object.values(BOOKING_STATUS) },
          },
          {
            name: 'timeStatus',
            in: 'query',
            schema: { type: 'string', enum: ['UPCOMING', 'PAST'] },
          },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'district', in: 'query', schema: { type: 'string', enum: TASHKENT_DISTRICTS } },
          { name: 'weddingHallId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'hall',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Alias for weddingHallId',
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: { description: 'Paginated bookings list' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Booking details with snapshot services' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/bookings/{id}/cancel': {
      patch: {
        tags: ['Bookings'],
        summary: 'Cancel a booking (User, Hall Owner, or Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Booking successfully cancelled' },
          400: { description: 'Already cancelled or completed' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/bookings/{id}/pay': {
      post: {
        tags: ['Bookings', 'Payment'],
        summary: 'Idempotent mock payment for booking',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Payment successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: "Muvaffaqiyatli to'landi" },
                  },
                },
              },
            },
          },
          400: { description: 'Already paid or cancelled' },
        },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });

  const swaggerOptions = {
    swaggerOptions: {
      url: '/api-docs.json',
      persistAuthorization: true,
    },
    customSiteTitle: 'ToyxonaHub API Documentation',
  };

  app.use(
    '/api-docs',
    (req, res, next) => {
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('Cross-Origin-Opener-Policy');
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions)
  );
};
