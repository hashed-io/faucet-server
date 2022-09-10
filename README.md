# Hashed Faucet Server

Provides the backend services for token distribution for new accounts, reducing friction for user onboarding:

- Provides a public endpoint to get the details for authentication channels
- Provides a public endpoint to request the distribution of tokens, if the request is valid, tokens are sent to the provided address

## Endpoints

### Get authentication channel details

Returns the details for the specified authentication channel

Request:
```
curl -X 'GET' \
  'https://faucet-dev.hashed.systems/api/auth-channel/?authName=hashed-portal-google' \
  -H 'accept: application/json'
```
Response:
```
{
  "authName": "hashed-portal-google",
  "authProvider": "google",
  "audience": "281519001757-5694ukk11kka29kcmq7ifdk6e4ci26dd.apps.googleusercontent.com",
  "issuer": "https://accounts.google.com",
  "keyUrl": "https://www.googleapis.com/oauth2/v3/certs",
  "usernameClaim": "email",
  "distributionAmount": 1000000000
}
```

### Token distribution

Validates and executes distribution requests

Request:
```
curl -X 'POST' \
  'https://faucet-dev.hashed.systems/api/distribution/distribute' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "authName": "hashed-portal-google",
  "address": "5CUosdLowQn5KdZgXFqzUxGs3962cCWr1L8txYSyGkwsSFJY",
  "jwt": "jwt",
  "signature": "signature resulting from signing jwt"
}'
```

To run the hashed faucet server locally using the docker images:

`npm run start:all image`

To run the hashed faucet server locally by building the hashed faucet server image from the current project dir:

`npm run start:all build`

NOTE: Make sure to enter the correct values for WSS (Hashed network url) and FAUCET_ACCOUNT_SURI (mnemonic for the faucet account) in the .env.all file

The hashed private server services will be available at the following url:

`http://localhost:3000`

