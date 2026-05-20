
#start server
node rest.js

#first request
echo "registration test"
curl curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"max.mustermann@outlook.com","password": "12345"}'

