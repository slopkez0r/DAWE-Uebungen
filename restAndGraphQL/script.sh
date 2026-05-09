#each parameter represents each exercise

if [ "$1" = "a" ]; then
echo "fill datamodels (a)"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { addCity(name: \"Kazan\", population: 800000, coordinates: \"65754\", country: \"Russia\") { name population } }"}'

curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { addCity(name: \"Ufa\", population: 11000000, coordinates: \"4853438\", country: \"Russia\") { name population } }"}'
fi

if [ "$1" = "b" ]; then
echo "read some records (b)"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ readOneCountry(id: 1) { name capital { name } cities { name } rivers { name } } }"}'
fi

if [ "$1" = "c" ]; then
echo "use of different selectors for same object (c)"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ readOneCity(id: 1){name}, readOneCity(id:1){population}}"}'
fi

if [ "$1" = "d" ]; then
echo "mutation is used to change germany population. Response country name and only cities that have a population > 750k "
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation {updateCountry(id:1, population: 90000000){name cities(minPopulation: 750000){name population}}}"}'
fi

if [ "$1" = "e" ]; then
echo "delete all records with single mutation - dont want to do it"
fi