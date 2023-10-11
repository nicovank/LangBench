-include ../../../C++/Makefile.defaults

compile:
	$(CXX) -std=c++20 $(CXXFLAGS) -o client.o client.cpp

run-client:
	./client.o localhost 8080 1 ../filenames.txt
