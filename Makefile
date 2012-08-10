test:
	@./node_modules/.bin/mocha \
		--reporter landing \
		test/controllers/*.js \
		test/lib/*.js \
		test/models/*.js

.PHONY: test