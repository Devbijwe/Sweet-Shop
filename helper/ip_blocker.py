

from flask import make_response, request, jsonify

import time
import hashlib

from functools import wraps,update_wrapper
from  datetime import datetime,timedelta
from functools import wraps
from flask import request, jsonify
import os

blacklisted_tokens=set()
# Store request timestamps per user for rate limiting
user_request_timestamps = {}
token_data = {}


def get_remaining_time(token):
    expiration_time = token_data.get(token)
    if expiration_time and isinstance(expiration_time, (float, int)):
        if time.time() < expiration_time:
            return int(expiration_time - time.time())
    return None



def is_valid_token(token):
    """
    Check if the token is valid based on the token_data.

    Parameters:
    - token: The token to be checked.
    - token_data: A dictionary containing token information, including expiration time.

    Returns:
    - True if the token is present and not expired, False otherwise.
    """
    if token in token_data and time.time() < token_data[token]:
        return True
    else:
        return False
    
# Function to generate a unique and time-bound token
def generate_token():
    timestamp = str(int(time.time()))
    unique_string = f"secret_salt_{timestamp}"  # Add a secret salt for added security
    token = hashlib.sha256(unique_string.encode()).hexdigest()
    expiration_time = time.time() + 60 * 5  # Token is valid for 5 minutes
    # Store the token and its expiration time
    token_data[token] = expiration_time
    return token, expiration_time

def ip_rate_limit(limit, per):
    def decorator(f):
        request_counts = {}

        @wraps(f)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            print(id)
            # Get the current timestamp
            now = datetime.now()

            # Get the timestamp of the last request from this IP for this specific endpoint
            last_request_timestamp = user_request_timestamps.get(ip)

            # If there was a previous request, check if it's within the rate limit window
            if last_request_timestamp is not None and now - last_request_timestamp < per:
                request_count = request_counts.get(ip, 0) + 1
                request_counts[ip] = request_count

                # Check if the request count exceeds the limit
                if request_count > limit:
                    # Calculate the time remaining until the next allowed request
                    remaining_time = per - (now - last_request_timestamp)

                    # Return a 429 Too Many Requests error response with the remaining time
                    response = make_response(jsonify({'error': 'Too many requests', 'retry-after': str(int(remaining_time.total_seconds()))+" seconds"}), 429)
                    response.headers['Retry-After'] = str(int(remaining_time.total_seconds()))
                    return response

            # Update the timestamp and request count for this user's request
            user_request_timestamps[ip] = now
            request_counts[ip] = request_counts.get(ip, 0) + 1

            # Call the decorated function
            return f(*args, **kwargs)

        return update_wrapper(wrapper, f)
        return wrapper

    return decorator
