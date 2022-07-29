# hybr1d-backend-assignment

## API Docs
https://documenter.getpostman.com/view/1088755/Uzds1o2Z

## Technology & Tools
- Node.js
- Moleculer Framework
- MongoDB Database

## Dev/Test Setup
```
1. Run docker-compose up -d
2. Will startup the app on 3000

```

## Directory Structure
```
.
├── controllers/                // route orchestrator
├── mxins/                      // Mixins for reusable code
│   └── mongo.adapter.js        // MongoDB connection Adapter
├── models/                     // Mongoose Schema
├── routes/
│   └── api.main.js             // api gateway routes
├── services/                   // Services directory (deployable)
│   ├── apiMain.service.js      // api gateway
│   └── user.service.js         // user service (db)
├── utils/                      // helpers
└── moleculer.config.js         // Moleculer config
```

## Default Users for testing
Seller: seller@gmail.com
Buyer: buyer@gmail.com
Password: haha1234
