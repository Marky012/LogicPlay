import pytest
import sys

with open("pytest_output.txt", "w", encoding="utf-8") as f:
    sys.stdout = f
    sys.stderr = f
    pytest.main(["-v", "tests/"])
