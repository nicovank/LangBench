-include ../Makefile.defaults

compile:
	$(CXX) $(CXXFLAGS) -pthread -o file_server.o file_server.cpp

run-server:
	./file_server.o 0.0.0.0 8080 ../../data/file-server
