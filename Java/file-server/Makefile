ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) FileServer.java

run-server:
	$(JAVA) FileServer 0.0.0.0 8080 ../../benchmark-data/file-server

run:
	python3 ../../benchmark-data/run-server-client.py \
		--server-command "$(JAVA) FileServer 0.0.0.0 8080 ../../benchmark-data/file-server" \
		--client-command "../../benchmark-data/file-server/client/client.o localhost 8080 1 ../../benchmark-data/file-server/filenames.txt" \
		--ready-matcher ".* initialized"

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" python3 ../../benchmark-data/run-server-client.py '\
		--server-command "$(JAVA) FileServer 0.0.0.0 8080 ../../benchmark-data/file-server" \
		--client-command "../../benchmark-data/file-server/client/client.o localhost 8080 1 ../../benchmark-data/file-server/filenames.txt" \
		--ready-matcher ".* initialized"'
