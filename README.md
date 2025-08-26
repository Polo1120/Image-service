# Image Service API

## Description

This is a robust and scalable image processing service built with Node.js, Express, and TypeScript. It provides functionalities for user authentication, image upload, and image management, leveraging Cloudinary for storage and processing.

## Features

- **User Authentication**: Secure user registration and login with JWT.
- **API Key Authentication**: Protect API endpoints with API key validation.
- **Image Upload**: Upload images to Cloudinary with `multer`.
- **Image Management**: Retrieve, update, and delete images.
- **Rate Limiting**: Prevent abuse with request rate limiting.
- **Error Handling**: Centralized error handling for a consistent API response.
- **Input Validation**: Validate request bodies using `express-validator`.

## Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/image-service.git
    cd image-service
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Variables**: Create a `.env` file in the root directory and add the following:

    ```
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    API_KEY=your_api_key
    ```

## Usage

**Development**:

```bash
npm run dev
```

**Build and Start**:

```bash
npm run build
npm start
```

The API will be running on `http://localhost:3000` (or your specified PORT).

## API Endpoints

This section outlines the available API endpoints, their functionalities, and authentication requirements.

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description                  | Authentication Required |
| :----- | :---------- | :--------------------------- | :---------------------- |
| `POST` | `/register` | Register a new user.         | No                      |
| `POST` | `/login`    | Log in a user and get a JWT. | No                      |

#### `POST /api/auth/register`

Registers a new user with the provided credentials.

**Request Content:** JSON body

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response Body (Success 201):**

```json
{
  "message": "User registered successfully"
}
```

**Response Body (Error 400):**

```json
{
  "message": "Error message"
}
```

#### `POST /api/auth/login`

Logs in a user and returns a JWT token for authentication.

**Request Content:** JSON body

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response Body (Success 200):**

```json
{
  "token": "string"
}
```

**Response Body (Error 401):**

```json
{
  "message": "Invalid credentials"
}
```

### Image Routes (`/api/images`)

| Method   | Endpoint  | Description                                | Authentication Required |
| :------- | :-------- | :----------------------------------------- | :---------------------- |
| `POST`   | `/upload` | Upload a new image.                        | Yes (JWT & API Key)     |
| `GET`    | `/`       | Get all images for the authenticated user. | Yes (JWT & API Key)     |
| `GET`    | `/:id`    | Get a single image by ID.                  | Yes (JWT & API Key)     |
| `PUT`    | `/:id`    | Update image details by ID.                | Yes (JWT & API Key)     |
| `DELETE` | `/:id`    | Delete an image by ID.                     | Yes (JWT & API Key)     |

#### `POST /api/images/upload`

Uploads a new image to Cloudinary. Requires `Authorization` header with JWT and `x-api-key` header.

**Request Content:** `multipart/form-data` (carrying the image file)

**Request Body (multipart/form-data):**

- `file`: The image file to upload (e.g., `.jpg`, `.png`).
- `title` (optional): A string representing the title of the image.
- `message` (optional): A string containing a description or message for the image.
- `location` (optional): A string indicating the location where the image was taken or is relevant to.
- `dateSpecial` (optional): A string representing a special date associated with the image (e.g., "2025-08-26").
- `tags` (optional): A string of comma-separated tags (e.g., "nature, landscape") or an array of strings.

**Response Body (Success 201):**

```json
{
  "message": "Image uploaded successfully",
  "image": {
    "_id": "string",
    "url": "string",
    "publicId": "string",
    "user": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Response Body (Error 400/401/500):**

```json
{
  "message": "Error message"
}
```

#### `GET /api/images`

Retrieves all images associated with the authenticated user. Requires `Authorization` header with JWT and `x-api-key` header.

**Request Content:** None (Authentication via Headers)

**Response Body (Success 200):**

```json
[
  {
    "_id": "string",
    "url": "string",
    "publicId": "string",
    "user": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Response Body (Error 401/500):**

```json
{
  "message": "Error message"
}
```

#### `GET /api/images/:id`

Retrieves a single image by its ID. Requires `Authorization` header with JWT and `x-api-key` header.

**Request Content:** Path Parameter

**Path Parameters:**

- `id`: The ID of the image to retrieve.

**Response Body (Success 200):**

```json
{
  "_id": "string",
  "url": "string",
  "publicId": "string",
  "user": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Response Body (Error 401/404/500):**

```json
{
  "message": "Error message"
}
```

#### `PUT /api/images/:id`

Updates the details of an image by its ID. Requires `Authorization` header with JWT and `x-api-key` header.

**Request Content:** Path Parameter and JSON body

**Path Parameters:**

- `id`: The ID of the image to update.

**Request Body:**

```json
{
  "newUrl": "string" // Optional: New URL for the image
}
```

**Response Body (Success 200):**

```json
{
  "message": "Image updated successfully",
  "image": {
    "_id": "string",
    "url": "string",
    "publicId": "string",
    "user": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Response Body (Error 400/401/404/500):**

```json
{
  "message": "Error message"
}
```

#### `DELETE /api/images/:id/delete`

Deletes an image by its ID. Requires `Authorization` header with JWT and `x-api-key` header.

**Request Content:** Path Parameter

**Path Parameters:**

- `id`: The ID of the image to delete.

**Response Body (Success 200):**

```json
{
  "message": "Image deleted successfully"
}
```

**Response Body (Error 401/404/500):**

```json
{
  "message": "Error message"
}
```

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB (via Mongoose)
- Cloudinary
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Express Validator for input validation
- Express Rate Limit for rate limiting

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
