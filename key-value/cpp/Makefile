-include ../../Makefile.defaults

compile:
	$(CXX) -std=c++17 -pthread $(CXXFLAGS) -o key_value.o key_value.cpp hashmap.cpp

run:
	screen -dmS key_value ./key_value.o 127.0.0.1 51234 24576 1024
	$(REDIS_BENCHMARK) -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234
	screen -S key_value -X stuff '^C'
