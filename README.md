# DrivenPass
With the constant increase in passwords, cards, and keys needed to access online services, many are challenged to efficiently and securely manage this information. DrivenPass steps in as the solution, providing a comprehensive platform for managing credentials, cards, software licenses, texts, and Wi-Fi settings, with a focus on security and ease of use.
<p align='center'>
  Check-out the swagger documentation: https://driven-pass-nest.onrender.com/api
</p>

### About
This is a backend project, a RESTful API, designed to empower users to securely manage their credentials, cards, notes, Wi-Fi information, and software licenses. DrivenPass includes the following implemented features:

<ul>
  <li>
    Sign-up
  </li>
  <li>
    Sign-in
  </li>
  <li>
    Create, retrieve, and delete credentials.
  </li>
  <li>
    Create, retrieve, and delete cards.
  </li>
  <li>
    Create, retrieve, update, and delete notes.
  </li>
  <li>
    Create, retrieve, and delete Wi-Fi information.
  </li>
  <li>
    Create, retrieve, and delete software licenses.
  </li>
  <li>
    Purge account and all related information
  </li>
</ul>

DrivenPass ensures data security and efficient management, providing users with a robust platform to centralize their digital information.
All sensitive data is encrypted.

### Technologies
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

### How to use
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

### Running tests
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
