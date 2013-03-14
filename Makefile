# Makefile
#
# CourseShark make file (auto-run before launch)
#
#


# Builds the production scripts
build:
	mkdir -p /tmp/courseshark/build/
	cp -R ./public/scripts/backbone-schedule/* /tmp/courseshark/build
	coffee -b -o /tmp/courseshark/build ./public/scripts/backbone-schedule/
	r.js -o /tmp/courseshark/build/build.js
	mv /tmp/courseshark/build/build.main.js ./public/scripts/backbone-schedule/build.main.js
	rm -rf /tmp/courseshark




.PHONY: build
