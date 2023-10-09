import argparse
import subprocess
import re
import signal
import os


def main(args):
    server = subprocess.Popen(
        args.server_command,
        shell=True,
        text=True,
        stderr=subprocess.STDOUT,
        stdout=subprocess.PIPE,
    )

    matcher = re.compile(args.ready_matcher)

    while True:
        line = server.stdout.readline().strip()
        if matcher.search(line):
            print("[server] Ready.")
            break
        elif line:
            print(f"[server] {line}")

    client = subprocess.Popen(
        args.client_command,
        shell=True,
        text=True,
        stderr=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
    )

    client.communicate()
    server.kill()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--server-command", type=str, required=True)
    parser.add_argument("--client-command", type=str, required=True)
    parser.add_argument("--ready-matcher", type=str, required=True)

    main(parser.parse_args())