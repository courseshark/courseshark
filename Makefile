SS_VERSION=selenium-server-standalone-2.25.0.jar

default: test

test: run-tests stop-courseshark clean

# Remove all the remaining logs
clean:
	rm ./selenium-log.log ./courseshark-log.log

#stops the courseshark instance
stop-courseshark:
	echo "TO_DO"

# Run the tests through mocha
run-tests: startup-selenium
	@echo "Begining Test"
	@./node_modules/.bin/mocha \
		--reporter spec \
		test/controllers/*.js \
		test/lib/*.js \
		test/models/*.js

#Download and start the selenium server
startup-selenium: startup-courseshark
	@if [ -f ./bin/$(SS_VERSION) ]; \
	then \
		echo "Found Selenium"; \
	else\
	 echo "Installing Selenium Server $(SS_VERSION)";\
	 wget -P ./bin/ http://selenium.googlecode.com/files/$(SS_VERSION);\
	fi
	@echo "Starting Selenium"
	
	@echo "" > ./selenium-log.log  # create an empty log file
	@java -jar "./bin/$(SS_VERSION)" > ./selenium-log.log &\
		{ tail -n +1 -f ./selenium-log.log & } | sed -n '/Started SocketListener/q'

#Start a courseshark instance
startup-courseshark:
	@echo "Starting CouseShark"
	@echo "" > ./courseshark-log.log
	@./courseshark nodemon > ./courseshark-log.log &&\
		echo $! > ./bin/selenium.pid &\
		{ tail -n +1 -f ./courseshark-log.log & } | sed -n '/CourseShark started/q'

.PHONY: test