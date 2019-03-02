#API

##EXAMPLES

###LOGIN
```curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" --request POST --data '{"username":"value1", "password":"value2"}' http://127.0.0.1:3002/api/login```

###REGISTER
```curl -v -d '{"username":"andrew", "password":"GiveMeMyBestShot", "sessionId": "mySession"}' -H "Content-Type: application/json" -X POST http://localhost:3002/api/register```

###ACHIEVEMENT
####LIST
```curl -v -H "Accept: application/json" -H "Content-Type: application/json" http://127.0.0.1:3002/api/achievement/list```

####OWN
```curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" http://127.0.0.1:3002/api/achievement/own```

####SET
```curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" --request POST --data '{"userId":1, "achievementId":1}' http://127.0.0.1:3002/api/achievement/set```
