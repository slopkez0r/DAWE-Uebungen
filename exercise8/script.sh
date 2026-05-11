#each parameter represents each exercise

if [ "$1" = "create" ]; then
echo "create country bulgaria"
curl -X POST http://localhost:3000/create/country \
  -H "Content-Type: application/json" \
  -d '{"name":"Bulgaria","is_democratic":true,"population":6700000}'

fi

if [ "$1" = "read" ]; then
echo "read created record"
curl -X GET http://localhost:3000/read/country/6 \
  -H "Content-Type: application/json"
fi

if [ "$1" = "search" ]; then
echo "search for country with name bulgaria"
curl -X POST http://localhost:3000/search/jsonBody/country \
  -H "Content-Type: application/json" \
  -d '{"name":"Bulgaria", "operator":"=", "by": "name", "type": "desc"}'

fi

if [ "$1" = "update" ]; then
echo "update population of bulgaria"
curl -X PUT http://localhost:3000/update/country \
  -H "Content-Type: application/json" \
  -d '{"id":6, "population":6000000}'
fi

if [ "$1" = "delete" ]; then
echo "delete created country"
curl -X DELETE http://localhost:3000/delete/country/6 \
  -H "Content-Type: application/json"
fi