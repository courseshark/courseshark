test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		test/controllers/*.js \
		test/lib/*.js \
		test/models/*.js

.PHONY: test