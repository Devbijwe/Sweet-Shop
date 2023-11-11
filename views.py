from datetime import timedelta
from flask import Flask, flash, redirect, render_template, request, jsonify, url_for
from helper.discount_distibution import apply_discount

from helper.ip_blocker import generate_token, get_remaining_time, ip_rate_limit, is_valid_token
from app import app


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/register')
def registration():
    return render_template('registration.html')


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/events/diwali_offer')
@ip_rate_limit(limit=3, per=timedelta(days=1))
def scratch():
     # Generate a unique token for this session
    token, expiration_time = generate_token()

    # Generate a URL with the token as a parameter
    token_url = url_for('scratch_with_token', token=token, _external=True)
    return redirect(token_url)
   

@app.route('/s/events/diwali_offer')
def scratch_with_token():
    # Check if the token is valid and has not expired
    token=request.args.get("token")
    if is_valid_token(token):
        original_price = 100  # Replace this with the price you want to apply discounts to
        max_discount_percent = 20  # Set the maximum discount percentage
        probability_of_discount = 0.15
        discount_ranges = [(1, 2), (3, 5), (6, 10), (11, max_discount_percent)]
        discount_probabilities = [0.475, 0.3, 0.2, 0.050]

        # Calculate a single discount scenario
        discounted_price, discount_percent = apply_discount(original_price, probability_of_discount, max_discount_percent, discount_ranges, discount_probabilities)
        
        if discount_percent:
            scratch_text = f"Congratulations! You have won a {discount_percent}% discount! The final price is ₹{discounted_price:.2f}."
        else:
            scratch_text = "Better luck next time. We appreciate your participation."
        
        return render_template('scratch_card.html',token=token, discounted_price=discounted_price, discount_percent=discount_percent, scratch_text=scratch_text)

    else:
        return "Invalid or expired token."
            
@app.route('/get_remaining_time', methods=['POST'])
def get_remaining_time_endpoint():
    data = request.get_json()

    if 'token' in data:
        token = data['token']
        # print(token)
        remaining_time = get_remaining_time(token)
        # print(remaining_time)
        if remaining_time is not None:
            return jsonify({'remaining_time': remaining_time})

    # Return a message indicating an invalid or expired token
    return jsonify({'message': 'Invalid or expired token.'}), 400


@app.errorhandler(404)
def page_not_found(error):
    return redirect( url_for("home"))



