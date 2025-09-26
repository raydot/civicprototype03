#!/usr/bin/env python3
"""
Health check script for monitoring and deployment verification
"""
import requests
import sys
import time
from typing import Optional


def check_health(base_url: str, timeout: int = 30) -> bool:
    """
    Check if the service is healthy
    
    Args:
        base_url: Base URL of the service
        timeout: Timeout in seconds
        
    Returns:
        True if healthy, False otherwise
    """
    try:
        response = requests.get(
            f"{base_url}/health",
            timeout=timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("status") == "healthy"
        
        return False
        
    except requests.exceptions.RequestException as e:
        print(f"Health check failed: {e}")
        return False


def check_readiness(base_url: str, timeout: int = 30) -> bool:
    """
    Check if the service is ready to handle requests
    
    Args:
        base_url: Base URL of the service
        timeout: Timeout in seconds
        
    Returns:
        True if ready, False otherwise
    """
    try:
        response = requests.get(
            f"{base_url}/ready",
            timeout=timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("status") == "ready"
        
        return False
        
    except requests.exceptions.RequestException as e:
        print(f"Readiness check failed: {e}")
        return False


def wait_for_service(base_url: str, max_attempts: int = 30, delay: int = 2) -> bool:
    """
    Wait for service to become healthy
    
    Args:
        base_url: Base URL of the service
        max_attempts: Maximum number of attempts
        delay: Delay between attempts in seconds
        
    Returns:
        True if service becomes healthy, False if timeout
    """
    print(f"Waiting for service at {base_url} to become healthy...")
    
    for attempt in range(max_attempts):
        if check_health(base_url):
            print(f"✅ Service is healthy after {attempt + 1} attempts")
            return True
        
        print(f"⏳ Attempt {attempt + 1}/{max_attempts} - Service not ready yet")
        time.sleep(delay)
    
    print(f"❌ Service did not become healthy after {max_attempts} attempts")
    return False


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Health check for AI Recommendation Service")
    parser.add_argument(
        "--url", 
        default="http://localhost:8000",
        help="Base URL of the service (default: http://localhost:8000)"
    )
    parser.add_argument(
        "--wait",
        action="store_true",
        help="Wait for service to become healthy"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Request timeout in seconds (default: 30)"
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=30,
        help="Maximum attempts when waiting (default: 30)"
    )
    
    args = parser.parse_args()
    
    if args.wait:
        success = wait_for_service(args.url, args.max_attempts)
    else:
        print(f"Checking health of service at {args.url}")
        health_ok = check_health(args.url, args.timeout)
        ready_ok = check_readiness(args.url, args.timeout)
        
        if health_ok:
            print("✅ Health check: PASSED")
        else:
            print("❌ Health check: FAILED")
        
        if ready_ok:
            print("✅ Readiness check: PASSED")
        else:
            print("❌ Readiness check: FAILED")
        
        success = health_ok and ready_ok
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
