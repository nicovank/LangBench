import os
import uuid

ROOT = os.path.dirname(os.path.abspath(__file__))
N = 1000 # Number of files to generate.
S = 1000 # Size of each file in bytes.


with open(os.path.join(ROOT, f"filenames.txt"), "w") as list:
    for i in range(N):
        filename = f"{uuid.uuid4()}.blob"
        with open(os.path.join(ROOT, filename), "wb") as file:
            file.write(os.urandom(S))
        list.write(f"{filename}\n")
