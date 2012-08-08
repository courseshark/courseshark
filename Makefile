test:
	@./node_modules/.bin/mocha \
		--reporter list \
		test/controllers/*.js

.PHONY: test