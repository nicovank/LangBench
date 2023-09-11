#!/usr/bin/env python3

from typing import List
import sys


def verify(board: List[List[int]]) -> bool:
    for i in range(9):
        row_check: List[bool] = [False] * 10
        col_check: List[bool] = [False] * 10
        for j in range(9):
            if board[i][j] == 0:
                return False
            if row_check[board[i][j]]:
                return False
            row_check[board[i][j]] = True

            if col_check[board[j][i]]:
                return False
            col_check[board[j][i]] = True

    for i in range(0, 9, 3):
        for j in range(0, 9, 3):
            check: List[bool] = [False] * 10
            for k in range(9):
                x: int = i + (k // 3)
                y: int = j + (k % 3)
                if check[board[x][y]]:
                    return False
                check[board[x][y]] = True
    return True


def chunk(str, n):
    return [str[i : i + n] for i in range(0, len(str), n)]


def main(args):
    with open(args[0], "r") as file:
        input = [line.strip() for line in file]
    output = [line.strip() for line in sys.stdin]
    assert len(input) == len(output)
    for i in range(len(input)):
        assert len(input[i]) == len(output[i])
        for j in range(len(input[i])):
            assert input[i][j] == "." or input[i][j] == output[i][j]
        line = output[i]
        assert verify([[int(c) for c in line[i : i + 9]] for i in range(0, 81, 9)])


if __name__ == "__main__":
    main(sys.argv[1:])
