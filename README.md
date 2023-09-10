# DrivenPass
With the constant increase in passwords, cards, and keys needed to access online services, many are challenged to efficiently and securely manage this information. DrivenPass steps in as the solution, providing a comprehensive platform for managing credentials, cards, software licenses, texts, and Wi-Fi settings, with a focus on security and ease of use.
<p align='center'>
  Check-out the swagger documentation: https://driven-pass-nest.onrender.com/api
</p>

## About
This is a backend project, a RESTful API, designed to empower users to securely manage their credentials, cards, notes, Wi-Fi information, and software licenses.

## Endpoints
<details>
  <summary>Health Check</summary>
  <ul>
    <li>Hello world</li>
  <details>
    <summary>(GET "/")</summary>
  
  ```javascript
// response
  "Hello world"
  ```
  </details>
  <li>Health response</li>
  <details>
    <summary>(GET "/health")</summary>
  
  ```javascript
// response
  "I'm okay!"
  ```
  </details>
  <li>System health check</li>
  <details>
  <summary>(GET "/health/check")</summary>
  <ul>
    <li>Checks application health</li>
  </ul>

  ```javascript
// response
    {
      "status": "ok",
      "info": {
        "database": {
          "status": "up"
        }
      },
      "error": {},
      "details": {
        "database": {
          "status": "up"
        }
      }
    }
  ```
</details>
<br/>
</ul>
</details>
<br/>

<details>
  <summary>Authentication endpoints</summary>
<br/>
  <ul>
    <li>User registration (Singup)</li>
<details>
  <summary>
  (POST "auth/users/sign-up")
  </summary>
  <ul>
    <li>
      Creates user account
    </li>
    <li>
      Should not already be registered
    </li>
    <li>
      Password must be strong (minimum of 10 characters, 1 number, 1 lowercase, 1 uppercase and 1 symbol)
    </li>
  </ul>
    
  ```javascript
  // body
  {
    "email": "email@email.com", // unique email
    "password": "1mApAsSwoRd!", // strong password
  }
  ```
</details>
<br/>
<li>User authentication (Signin)</li>
<details>
  <summary>
  (POST "auth/users/sign-in")
  </summary>
  <ul>
    <li>
      Login into user's account
    </li>
    <li>
      Email must be registered
    </li>
    <li>
      Generates user's token
    </li>
  </ul>

    
  ```javascript
  // body
  {
    "email": "email@email.com", //registered email
    "password": "1mApAsSwoRd!",
  }
  ```
  ```javascript
  // response
  {
    "token": "1234-5678-91011", //session token
  }
  ```
</details>
</ul>
</details>
<br/>

<details>
  <summary>Credentials endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Register credentials</li>
  <details>
    <summary>(POST "/credentials")</summary>
    <ul>
      <li>Register a credential</li>
      <li>All sensitive data is encrypted</li>
      <li>It's not allowed to have multiple credentials with the same title for one user</li>
    </ul>
  
```javascript
// body
  {
  "title": "My credential",        // unique title for user
  "url": "https://www.google.com",
  "username": "my-username",
  "password": "Str0nG!P4szwuRd"
}
```
  </details>
  <br/>
<li>Get all user's credentials</li>
  <details>
    <summary>(GET "/credentials")</summary>
    <ul>
      <li>Get all user's credentials</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
  [
    {
      "id": 1,
      "title": "My credential",
      "url": "https://www.google.com",
      "username": "my-username",
      "password": "Str0nG!P4szwuRd"
    }, ...
  ]
```
  </details>
  <br/>
<li>Get one user's credential</li>
  <details>
    <summary>(GET "/credentials/:id")</summary>
    <ul>
      <li>Get user's credential</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
    {
      "id": 1,
      "title": "My credential",
      "url": "https://www.google.com",
      "username": "my-username",
      "password": "Str0nG!P4szwuRd"
    }
```
  </details>
    <br/>
<li>Delete user's credential</li>
  <details>
    <summary>(DELETE "/credentials/:id")</summary>
    <ul>
      <li>Delete user's credential</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```
  </details>

  
  </ul>
</details>
<br/>

<details>
  <summary>Cards endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Register cards</li>
  <details>
    <summary>(POST "/cards")</summary>
    <ul>
      <li>Register a card</li>
      <li>All sensitive data is encrypted</li>
      <li>It's not allowed to have multiple cards with the same title for one user</li>
    </ul>
  
```javascript
// body
  {
    "title": "My card",               // unique title for user
    "number": "4444111111111111",
    "name": "Vovo Juju",
    "cvv": "111",
    "expiration": "12/28",
    "password": "123456",
    "virtual": true,
    "type": "BOTH"                    // CREDIT || DEBIT || BOTH
  }
```
  </details>
  <br/>
<li>Get all user's cards</li>
  <details>
    <summary>(GET "/cards")</summary>
    <ul>
      <li>Get all user's cards</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
  [
    {
      "id":1,
      "title": "My card",               
      "number": "4444111111111111",
      "name": "Vovo Juju",
      "cvv": "111",
      "expiration": "12/28",
      "password": "123456",
      "virtual": true,
      "type": "BOTH"                    
    }, ...
  ]
```
  </details>
  <br/>
<li>Get one user's card</li>
  <details>
    <summary>(GET "/cards/:id")</summary>
    <ul>
      <li>Get user's card</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
    {
      "id":1,
      "title": "My card",               
      "number": "4444111111111111",
      "name": "Vovo Juju",
      "cvv": "111",
      "expiration": "12/28",
      "password": "123456",
      "virtual": true,
      "type": "BOTH"                    
    }
```
  </details>
    <br/>
<li>Delete user's card</li>
  <details>
    <summary>(DELETE "/cards/:id")</summary>
    <ul>
      <li>Delete user's card</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```
  </details>
  
  </ul>
</details>
<br/>

<details>
  <summary>Notes endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Register notes</li>
  <details>
    <summary>(POST "/notes")</summary>
    <ul>
      <li>Register a note</li>
      <li>It's not allowed to have multiple notes with the same title for one user</li>
    </ul>
  
```javascript
// body
  {
    "title": "My note",        // unique title for user
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
  }
```
  </details>
  <br/>
<li>Get all user's notes</li>
  <details>
    <summary>(GET "/notes")</summary>
    <ul>
      <li>Get all user's notes</li>
    </ul>

```javascript
// response
  [
    {
      "id": 1,
      "title": "My note",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    }, ...
  ]
```

  </details>
  <br/>
<li>Get one user's note</li>
  <details>
    <summary>(GET "/notes/:id")</summary>
    <ul>
      <li>Get user's note</li>
    </ul>

```javascript
// response
    {
      "id": 1,
      "title": "My note",
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    }
```

  </details>
  <br/>
<li>Update one user's note</li>
  <details>
    <summary>(PUT "/notes/:id")</summary>
    <ul>
      <li>Updated user's note</li>
      <li>It's not allowed to have multiple notes with the same title for one user</li>
    </ul>

```javascript
// response
    {
      "title": "My note",        // optional
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit" // optional
    }
```

  </details>
    <br/>
<li>Delete user's note</li>
  <details>
    <summary>(DELETE "/notes/:id")</summary>
    <ul>
      <li>Delete user's note</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```

  </details>

  </ul>
</details>
<br/>

<details>
  <summary>Wifis endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Register wifis</li>
  <details>
    <summary>(POST "/wifis")</summary>
    <ul>
      <li>Register a wifi</li>
      <li>All sensitive data is encrypted</li>
    </ul>
  
```javascript
// body
  {
  "title": "My wifi",
  "name": "wifi-name",
  "password": "Str0nG!P4szwuRd"
  }
```
  </details>
  <br/>
<li>Get all user's wifis</li>
  <details>
    <summary>(GET "/wifis")</summary>
    <ul>
      <li>Get all user's wifis</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
  [
    {
      "id": 1,
      "title": "My wifi",
      "name": "wifi-name",
      "password": "Str0nG!P4szwuRd"
    }, ...
  ]
```

  </details>
  <br/>
<li>Get one user's wifi</li>
  <details>
    <summary>(GET "/wifis/:id")</summary>
    <ul>
      <li>Get user's wifi</li>
      <li>Return decrypted sensitive data</li>
    </ul>

```javascript
// response
    {
      "id": 1,
      "title": "My wifi",
      "name": "wifi-name",
      "password": "Str0nG!P4szwuRd"
    }
```

  </details>
    <br/>
<li>Delete user's wifi</li>
  <details>
    <summary>(DELETE "/wifis/:id")</summary>
    <ul>
      <li>Delete user's wifi</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```

  </details>

  </ul>
</details>
<br/>

<details>
  <summary>Licenses endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Register licenses</li>
  <details>
    <summary>(POST "/licenses")</summary>
    <ul>
      <li>Register a license</li>
      <li>It's not allowed to have multiple licenses keys for the same software name and version for one user</li>
    </ul>
  
```javascript
// body
  {
  "softwareName": "Windows 10",
  "softwareVersion": "Pro",
  "licenseKey": "software-serial-number",
}
```
  </details>
  <br/>
<li>Get all user's licenses</li>
  <details>
    <summary>(GET "/licenses")</summary>
    <ul>
      <li>Get all user's licenses</li>
    </ul>

```javascript
// response
  [
    {
      "id": 1,
      "softwareName": "Windows 10",
      "softwareVersion": "Pro",
      "licenseKey": "software-serial-number",
    }, ...
  ]
```

  </details>
  <br/>
<li>Get one user's license</li>
  <details>
    <summary>(GET "/licenses/:id")</summary>
    <ul>
      <li>Get user's license</li>
    </ul>

```javascript
// response
    {
      "id": 1,
      "softwareName": "Windows 10",
      "softwareVersion": "Pro",
      "licenseKey": "software-serial-number",
    }
```

  </details>
    <br/>
<li>Delete user's license</li>
  <details>
    <summary>(DELETE "/licenses/:id")</summary>
    <ul>
      <li>Delete user's license</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```

  </details>

  </ul>
</details>
<br/>

<details>
  <summary>Users endpoints 🔒</summary>
  <br/>
  <ul>
<li>Authorization protected routes</li>
    <br/>
<li>Count registrations</li>
  <details>
    <summary>(GET "/users/count")</summary>
    <ul>
      <li>Return the count of every registered entry the user has</li>
    </ul>
  
```javascript
// response
  {
    "Credential": 1,
    "Note": 2,
    "Card": 3,
    "Wifi": 4,
    "License": 5,
  }
```
  </details>
  <br/>
<li>Erase all user's information</li>
  <details>
    <summary>(POST "/users/erase")</summary>
    <ul>
      <li>Purge account</li>
      <li>Deletes every user's registered information</li>
    </ul>

```javascript
// response
   httpsStatus: 204 (NO CONTENT)
```

  </details>
  <br/>

  </ul>
</details>
<br/>

DrivenPass ensures data security and efficient management, providing users with a robust platform to centralize their digital information.

All sensitive data is encrypted.

## Technologies
The following tools and frameworks were used in the construction of the project:
<p>
  <img style='margin: 5px;' src='https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white'/>
</p>

## How to use
1. Clone this repository
2. Install dependencies
```bash
$ npm i
```

3. Setup your environment variables (.env)

4. Create your database with prisma
```bash
$ npx prisma migrate dev
$ npx prisma generate
```

5. Run the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running tests
1. Setup your environment variables (.env.test)
   
2. Create your database with prisma
```bash
$ npm run test:prisma
```

3. Run tests
```bash
# run unit tests
$ npm run test

# run e2e tests
$ npm run test:e2e

# run unit+e2e tests
$ npm run test:all

# run unit coverage tests
$ npm run test:cov

# run unit+e2e coverage tests
$ npm run test:all:cov
```
