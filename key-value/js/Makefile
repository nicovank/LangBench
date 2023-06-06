ifndef NODE
NODE := node
endif

compile:

run:
	screen -dmS key_value $(NODE) key_value.js 127.0.0.1 51234 24576 1024
	$(REDIS_BENCHMARK) -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234
	screen -S key_value -X stuff '^C'
