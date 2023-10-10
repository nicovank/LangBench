ifndef GO
GO := go
endif

compile:
	$(GO) build -o file_server.o default/file_server.go

run-server:
	./file_server.o 0.0.0.0 8080 ../../data/file-server
