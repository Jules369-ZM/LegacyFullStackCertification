#!/usr/bin/env python3
"""
Port Scanner - A simple network port scanning tool
"""

import socket
import argparse
import threading
import time
from concurrent.futures import ThreadPoolExecutor
import ipaddress


def scan_port(host, port, timeout=1):
    """
    Scan a single port on a host.

    Args:
        host (str): Target host IP or hostname
        port (int): Port number to scan
        timeout (float): Connection timeout in seconds

    Returns:
        tuple: (port, status) where status is 'open' or 'closed'
    """
    try:
        # Create socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)

        # Attempt connection
        result = sock.connect_ex((host, port))

        # Clean up
        sock.close()

        if result == 0:
            return (port, 'open')
        else:
            return (port, 'closed')

    except socket.error as e:
        return (port, f'error: {str(e)}')
    except Exception as e:
        return (port, f'error: {str(e)}')


def scan_ports(host, ports, timeout=1, max_threads=100):
    """
    Scan multiple ports on a host using threading.

    Args:
        host (str): Target host IP or hostname
        ports (list): List of port numbers to scan
        timeout (float): Connection timeout in seconds
        max_threads (int): Maximum number of concurrent threads

    Returns:
        dict: Dictionary mapping ports to their status
    """
    results = {}

    print(f"Scanning {len(ports)} ports on {host}...")

    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        # Submit all port scans
        future_to_port = {
            executor.submit(scan_port, host, port, timeout): port
            for port in ports
        }

        # Collect results as they complete
        for future in future_to_port:
            port = future_to_port[future]
            try:
                port_num, status = future.result()
                results[port_num] = status

                # Print open ports immediately
                if status == 'open':
                    print(f"Port {port_num}: {status}")

            except Exception as e:
                results[port] = f'error: {str(e)}'

    return results


def parse_ports(port_string):
    """
    Parse port specification string into list of ports.

    Supports formats like:
    - "80" (single port)
    - "1-100" (range)
    - "22,80,443" (comma-separated)
    - "1-50,80,443,1000-1100" (mixed)

    Args:
        port_string (str): Port specification string

    Returns:
        list: List of port numbers
    """
    ports = set()

    # Split by comma
    parts = port_string.split(',')

    for part in parts:
        part = part.strip()

        if '-' in part:
            # Range specification
            try:
                start, end = map(int, part.split('-'))
                if start > end:
                    raise ValueError(f"Invalid range: {part}")
                ports.update(range(start, end + 1))
            except ValueError as e:
                raise ValueError(f"Invalid port range: {part}") from e
        else:
            # Single port
            try:
                port = int(part)
                if port < 1 or port > 65535:
                    raise ValueError(f"Port out of range: {port}")
                ports.add(port)
            except ValueError as e:
                raise ValueError(f"Invalid port number: {part}") from e

    return sorted(list(ports))


def validate_host(host):
    """
    Validate and resolve host.

    Args:
        host (str): Hostname or IP address

    Returns:
        str: Resolved IP address

    Raises:
        ValueError: If host is invalid
    """
    try:
        # Try to parse as IP address
        ipaddress.ip_address(host)
        return host
    except ValueError:
        # Try to resolve hostname
        try:
            ip = socket.gethostbyname(host)
            print(f"Resolved {host} to {ip}")
            return ip
        except socket.gaierror as e:
            raise ValueError(f"Could not resolve hostname: {host}") from e


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Simple Port Scanner')
    parser.add_argument('host', help='Target host (IP or hostname)')
    parser.add_argument('-p', '--ports', default='1-1024',
                       help='Ports to scan (default: 1-1024)')
    parser.add_argument('-t', '--timeout', type=float, default=1.0,
                       help='Connection timeout in seconds (default: 1.0)')
    parser.add_argument('--threads', type=int, default=100,
                       help='Maximum concurrent threads (default: 100)')

    args = parser.parse_args()

    try:
        # Validate host
        target_host = validate_host(args.host)

        # Parse ports
        ports_to_scan = parse_ports(args.ports)

        print(f"Port Scanner")
        print(f"Target: {args.host} ({target_host})")
        print(f"Ports: {args.ports} ({len(ports_to_scan)} ports)")
        print(f"Timeout: {args.timeout}s")
        print("-" * 50)

        # Start timing
        start_time = time.time()

        # Scan ports
        results = scan_ports(target_host, ports_to_scan,
                           args.timeout, args.threads)

        # Calculate elapsed time
        elapsed_time = time.time() - start_time

        # Count open ports
        open_ports = [port for port, status in results.items() if status == 'open']

        print("-" * 50)
        print(f"Scan completed in {elapsed_time:.2f} seconds")
        print(f"Open ports: {len(open_ports)}")

        if open_ports:
            print("Open ports:", ', '.join(map(str, sorted(open_ports))))
        else:
            print("No open ports found in the specified range.")

    except KeyboardInterrupt:
        print("\nScan interrupted by user.")
    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
