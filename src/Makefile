URL=http://admin:123@localhost:5984/_node/couchdb@127.0.0.1/_config

up:
	docker-compose up -d

down:
	docker-compose down

setup: up
	@sleep 5
	curl -X PUT $(URL)/httpd/enable_cors -d '"true"'
	curl -X PUT $(URL)/cors/origins -d '"*"'
	curl -X PUT $(URL)/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
	curl -X PUT $(URL)/cors/headers -d '"accept, authorization, content-type, origin, referer"'
	curl -X PUT $(URL)/cors/credentials -d '"true"'
