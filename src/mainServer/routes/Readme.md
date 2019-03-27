#API

##EXAMPLES

###AUTH
####LOGIN
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" --request POST --data '{"username":"value1", "password":"value2"}' http://127.0.0.1:3002/api/login`

####REGISTER
`curl -v -d '{"username":"andrew", "password":"GiveMeMyBestShot", "sessionId": "mySession"}' -H "Content-Type: application/json" -X POST http://localhost:3002/api/register`

###USER
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" http://127.0.0.1:3002/api/user/canIjoinToGrandFinal`

####LADDER
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" http://127.0.0.1:3002/api/user/tournament/2/ladder`

###ACHIEVEMENT
####LIST
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" http://127.0.0.1:3002/api/achievement/list`

####OWN
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" http://127.0.0.1:3002/api/achievement/own`

####SET
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" --request POST --data '{"userId":1, "achievementId":1}' http://127.0.0.1:3002/api/achievement/set`

###TOURNAMENT
###LIST
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" http://127.0.0.1:3002/api/tournament/list`

###PRETENDERS
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" --request GET http://localhost:3002/api/tournament/pretenders`

###GET STATS
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 123456789" http://127.0.0.1:3002/api/user/tournament/1/stats`

###UPDATE_STATS
`curl -v -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer 12345678" --request POST --data '{"deaths":20, "kills":50, "points":1}' http://127.0.0.1:3002/api/user/tournament/1/stats`
