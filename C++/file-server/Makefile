-include ../Makefile.defaults

compile:
	$(CXX) $(CXXFLAGS) -std=c++20 -pthread -o file_server.o file_server.cpp

run-server:
	./file_server.o 0.0.0.0 8080 ../../data/file-server

run:
	python3 ../../data/run-server-client.py \
		--server-command "./file_server.o 0.0.0.0 8080 ../../data/file-server" \
		--client-command "../../data/file-server/client/client.o localhost 8080 1 ../../data/file-server/filenames.txt" \
		--ready-matcher ".* initialized"

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" python3 ../../data/run-server-client.py '\
		--server-command "./file_server.o 0.0.0.0 8080 ../../data/file-server" \
		--client-command "../../data/file-server/client/client.o localhost 8080 1 ../../data/file-server/filenames.txt" \
		--ready-matcher ".* initialized"'
