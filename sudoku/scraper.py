#!/usr/bin/env python3

import sys
import urllib.request
from bs4 import BeautifulSoup


def pull(x):
    html = (
        urllib.request.urlopen(f"https://grid.websudoku.com/?level=4&set_id={x}")
        .read()
        .decode("utf-8")
    )
    soup = BeautifulSoup(html, features="html.parser")
    solution = soup.find(id="cheat")["value"]
    mask = soup.find(id="editmask")["value"]
    assert len(solution) == 9 * 9
    assert len(mask) == 9 * 9
    line = ""
    for i in range(9 * 9):
        z = int(mask[i])
        line += str(((z ^ 1) & 1) * int(solution[i]))
    print(line.replace("0", "."))


if __name__ == "__main__":
    for i in range(128):
        pull(i)
