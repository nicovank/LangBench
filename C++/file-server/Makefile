-include ../Makefile.defaults

compile:
	$(CXX) $(CXXFLAGS) -pthread -o file_server.o file_server.cpp

run:
	./file_server.o 0.0.0.0 8080 ../../data/file-server
