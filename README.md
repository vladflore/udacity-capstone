# Capstone Project

## Books Management Application

This is the backend of a Books Management Application, as part of the capstone project for the Udacity Cloud Developer
Nanodegree, built using NodeJs and AWS.

### The idea behind

The application's API is not meant to be accessed by a human end user, but rather by another application / script / job.
This way the caller can read in a data source, a list of books, and can use the API to manage them, basically keeping
track of the books a user has, together with which of them the user has already read.

### How it works

The backend is already running on AWS. To interact with it a Postman
collection(`UdacityCapstoneProject.postman_collection.json`) of requests has been provided.

The Web API can be accessed over the following link:

`https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev`

where:

* `<apiId>` represents the ID of the API as deployed on AWS (API Gateway)

All the endpoints have been secured, which means access is only allowed if a valid JWT token is present in the request.

The backend uses [auth0](https://auth0.com/) as an authorization and authentication platform and a custom authorizer has
been implemented to authorize requests based on the JWT. On a successful authorization the requests are allowed to go
through the API Gateway.

Before making any requests a client exchange request has to take place to obtain a valid access token:

```shell
curl --request POST \
  --url https://dev-t30egl7m.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"1evc7JS3wNIVK7zcgsRcUQhShj075tp9","client_secret":"TQInf7zSrmYaJ6v3uID1ZY_q2AZJZ430-Ix1-9-ngT-JkrABZfb_LTB2PHtI9uZB","audience":"https://dev-t30egl7m.us.auth0.com/api/v2/","grant_type":"client_credentials"}'
```

The access token can be found in the response of the POST request from above:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlVNRlp3d1VYU1p5SnVIT2hqbWFMeSJ9.eyJpc3MiOiJodHRwczovL2Rldi10MzBlZ2w3bS51cy5hdXRoMC5jb20vIiwic3ViIjoiMWV2YzdKUzN3TklWSzd6Y2dzUmNVUWhTaGowNzV0cDlAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LXQzMGVnbDdtLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjM1ODcwMTE1LCJleHAiOjE2MzU5NTY1MTUsImF6cCI6IjFldmM3SlMzd05JVks3emNnc1JjVVFoU2hqMDc1dHA5IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.l8ZvauwgEk0AxTVVfbwx7Log1n0hlPOpnbAyK3rHg1F3fgzNKxelZrx_Y04jq1SeUpKSJUQvFPLNrFLxxpEznOXWyzbg3ZC6L8XuSPmgvKshuemhjJMbNFPuCafA3jOmVKJgz5ibaqghRGX2Z5hdPzMqD9WBkrtYuYKtyAw-1yljz5lkEJbD3okDUBQQvvZtap6auC3W0XUOWBQd7BX6KXkoQnk_X-z2ggv8r7o3kr0_U_zKf8K2B61OLTlX4IocMGCjCfGzoEzpUbmwXcYZfivgRdP0vguN7vWxzRrq00zOZXzmAbvOdpSYTCgusL4GUGG3QhRVRWfCGFCLQIYxBw",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

This access token has to be used for all the other requests.

The Postman collection contains the following variables, which can be set by importing the Postman `dev`
environment(`dev.postman_environment.json`):

* `authToken`: the access token from above
* `apiId`: the ID of the Web API as deployed on AWS
* `region`: the AWS region

Import the Postman collection and the environment files into Postman and you should be good to go.

Available endpoints:

```shell
GET - https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev/books
POST - https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev/books
PATCH - https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev/books/{bookId}
DELETE - https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev/books/{bookId}
POST - https://<apiId>.execute-api.eu-central-1.amazonaws.com/dev/books/{bookId}/attachment
```