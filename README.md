# Simple Todo API

## Overview

This API is designed for developers who need a straightforward and accessible way to perform CRUD operations on a live database for testing purposes. It offers a no-authentication-needed interface, allowing for hassle-free interaction with the API endpoints. Please note that all data in the database gets reset every 24 hours.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete todos.
- **No Authentication Required**: No need to deal with API keys or authentication tokens.
- **Automatic Data Reset**: The database is reset every 24 hours to maintain a clean testing environment.

### Pre-Seeded Users

- The database is pre-seeded with users having IDs ranging from 1 to 999. Each of these users comes with a set of pre-filled todo items for testing purposes.
- You can perform CRUD operations on todos associated with these pre-seeded users to test various scenarios.

### Adding Todos for New Users

- When you insert a todo for a user ID that does not exist in the database, the system will automatically create (upsert) a new user with that ID.
- Newly created users through this upsert process will have no pre-filled todos.
- This allows you to test the API with both existing and dynamically created users.

## Endpoints

Base URL: `https://todo.api.kyrre.dev/`

### Todos

- **Get All Todos**

  - `GET /todos`
  - Optional query parameter: `completed` (`true` or `false`)

- **Get Todo by ID**

  - `GET /todos/{todoId}`

- **Create Todo**

  - `POST /todos`
  - Request body required (example below)

- **Update Todo**

  - `PATCH /todos/{todoId}`
  - Request body required (example below)

- **Delete Todo**

  - `DELETE /todos/{todoId}`

- **Mark Todo as Complete**
  - `PATCH /todos/{todoId}/complete`

### Health Check

- **API Health**
  - `GET /health`

---

## Data Privacy and Respectful Use

### Public Data

- Please be aware that all data entered into this testing API is **publicly accessible**. As there is no authentication or authorization mechanism, anyone can view or modify the data.
- Given its public nature, I strongly advise against posting sensitive, personal, or confidential information in the API.

### Respectful Use

- I ask you to be **mindful and respectful** when using this API. Since the data is accessible to others, please consider the content and nature of the todos and user information you create.
- To maintain a positive and useful testing environment for everyone, please avoid posting content that could be considered offensive, harmful, or inappropriate.

### Data Reset

- All data, including todos and user information, is reset every 24 hours.

## Contributing to a Safe Testing Environment

- Your cooperation is essential in keeping this testing environment safe, respectful, and valuable for all users. If you come across any content that violates these principles, please feel free to notify me.
- As the sole developer behind this project, I'm committed to providing a useful tool for fellow developers and appreciate your help in fostering a respectful and constructive community.
