#!/usr/bin/env python3
"""
Master Test Runner
Executes all test suites in order and generates a report
"""

import os
import sys
import subprocess
from datetime import datetime
from typing import List, Tuple

# ANSI color codes
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


class TestSuite:
    def __init__(self, name: str, script: str, required: bool = True):
        self.name = name
        self.script = script
        self.required = required
        self.passed = None
        self.output = ""


def run_test_suite(suite: TestSuite) -> bool:
    """Run a single test suite"""
    print(f"\n{BLUE}{'=' * 60}{RESET}")
    print(f"{BLUE}Running: {suite.name}{RESET}")
    print(f"{BLUE}{'=' * 60}{RESET}\n")

    try:
        result = subprocess.run(
            [sys.executable, suite.script], capture_output=True, text=True, timeout=60
        )

        suite.output = result.stdout + result.stderr
        print(suite.output)

        suite.passed = result.returncode == 0
        return suite.passed

    except subprocess.TimeoutExpired:
        suite.output = "Test timed out after 60 seconds"
        print(f"{RED}❌ TIMEOUT: {suite.name}{RESET}")
        suite.passed = False
        return False

    except FileNotFoundError:
        suite.output = f"Test script not found: {suite.script}"
        print(f"{RED}❌ NOT FOUND: {suite.script}{RESET}")
        suite.passed = False
        return False

    except Exception as e:
        suite.output = f"Error running test: {e}"
        print(f"{RED}❌ ERROR: {e}{RESET}")
        suite.passed = False
        return False


def generate_report(suites: List[TestSuite], output_file: str):
    """Generate a test report"""
    with open(output_file, "w") as f:
        f.write("=" * 80 + "\n")
        f.write("EVERAFTER WEDDING PLANNER - TEST REPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Environment: Development\n")
        f.write("\n")

        # Summary
        total = len(suites)
        passed = sum(1 for s in suites if s.passed)
        failed = sum(1 for s in suites if s.passed is False)
        skipped = sum(1 for s in suites if s.passed is None)

        f.write("SUMMARY\n")
        f.write("-" * 80 + "\n")
        f.write(f"Total Tests: {total}\n")
        f.write(f"Passed: {passed}\n")
        f.write(f"Failed: {failed}\n")
        f.write(f"Skipped: {skipped}\n")
        f.write(f"Success Rate: {(passed/total*100):.1f}%\n")
        f.write("\n")

        # Detailed results
        f.write("DETAILED RESULTS\n")
        f.write("-" * 80 + "\n")

        for suite in suites:
            status = (
                "PASS"
                if suite.passed
                else ("FAIL" if suite.passed is False else "SKIP")
            )
            f.write(f"\n[{status}] {suite.name}\n")
            f.write(f"Script: {suite.script}\n")
            if suite.output:
                f.write(f"\nOutput:\n{suite.output}\n")

        # Deployment readiness
        f.write("\n" + "=" * 80 + "\n")
        f.write("DEPLOYMENT READINESS\n")
        f.write("=" * 80 + "\n")

        critical_failed = [s for s in suites if s.required and not s.passed]

        if not critical_failed:
            f.write("✅ READY FOR DEPLOYMENT\n")
            f.write("All critical tests passed.\n")
        else:
            f.write("❌ NOT READY FOR DEPLOYMENT\n")
            f.write("The following critical tests failed:\n")
            for suite in critical_failed:
                f.write(f"  - {suite.name}\n")

        f.write("\n")


def main():
    """Run all test suites"""

    print(f"{BLUE}")
    print("=" * 80)
    print("EVERAFTER WEDDING PLANNER - MASTER TEST RUNNER")
    print("=" * 80)
    print(f"{RESET}\n")

    # Define test suites
    suites = [
        # Suite 1: Database Setup
        TestSuite(
            "TC-1.1: Database Schema", "execution/test_db_schema.py", required=True
        ),
        TestSuite(
            "TC-1.2: RLS Policies", "execution/test_rls_policies.py", required=True
        ),
        TestSuite(
            "TC-1.4: Storage Buckets",
            "execution/test_storage_buckets.py",
            required=True,
        ),
        # Suite 3: Communication
        TestSuite(
            "TC-3.1 & 3.2: Email/SMS Config",
            "execution/test_communication_config.py",
            required=False,
        ),
    ]

    # Run each suite
    results = []
    for suite in suites:
        passed = run_test_suite(suite)
        results.append(passed)

    # Generate report
    report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    generate_report(suites, report_file)

    print(f"\n{BLUE}{'=' * 60}{RESET}")
    print(f"{BLUE}TEST EXECUTION COMPLETE{RESET}")
    print(f"{BLUE}{'=' * 60}{RESET}\n")

    # Summary
    total = len(suites)
    passed = sum(results)
    failed = total - passed

    print(f"Total Suites: {total}")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {failed}{RESET}")
    print(f"\nDetailed report saved to: {report_file}")

    # Check deployment readiness
    critical_failed = [s for s in suites if s.required and not s.passed]

    if not critical_failed:
        print(f"\n{GREEN}✅ ALL CRITICAL TESTS PASSED{RESET}")
        print(f"{GREEN}System ready for deployment (pending manual tests){RESET}")
        sys.exit(0)
    else:
        print(f"\n{RED}❌ CRITICAL TESTS FAILED{RESET}")
        print(f"{RED}System NOT ready for deployment{RESET}")
        print(f"\nFailed critical tests:")
        for suite in critical_failed:
            print(f"  - {suite.name}")
        sys.exit(1)


if __name__ == "__main__":
    main()
