import random
import json
import os

def apply_discount(price, probability_of_discount, max_discount_percent, discount_ranges, discount_probabilities):
    # Generate a random number between 0 and 1
    random_number = random.random()

    if random_number <= probability_of_discount:  # Apply a discount based on the provided probability
        # Use custom probabilities to select a discount range
        selected_range = random.choices(
            population=range(len(discount_ranges)),
            weights=discount_probabilities
        )
        
        # Select a discount range based on the custom probabilities
        selected_range = discount_ranges[selected_range[0]]

        # Select a discount percentage within the chosen range
        discount_percent = random.randint(selected_range[0], selected_range[1])

        discounted_price = price * (1 - discount_percent / 100)
        return discounted_price, discount_percent
    else:
        # No discount applied
        return price, 0

if __name__=="__main__":
    # Set your parameters
    original_price = 100  # Replace this with the price you want to apply discounts to
    max_discount_percent = 20  # Set the maximum discount percentage
    probability_of_discount = 0.15
    discount_ranges = [(1, 2), (3, 5), (6, 10), (11, max_discount_percent)]
    discount_probabilities = [0.475, 0.3, 0.2, 0.050]

    # Generate discount scenarios and store them in a list
    discount_scenarios = []

    for _ in range(100000):
        discounted_price, discount_percent = apply_discount(original_price, probability_of_discount, max_discount_percent, discount_ranges, discount_probabilities)
        discount_scenarios.append((discounted_price, discount_percent))

    # Store the discount scenarios in a JSON file
    filename = 'discount_scenarios.json'
    if os.path.exists(filename):
        with open(filename, 'a') as json_file:
            json.dump(discount_scenarios, json_file)
            json_file.write('\n')  # Add a newline for each set of scenarios
    else:
        with open(filename, 'w') as json_file:
            json.dump(discount_scenarios, json_file)

    # Calculate the actual probability distribution
    discount_counts = [0] * len(discount_ranges)

    for _, discount_percent in discount_scenarios:
        for i, (min_range, max_range) in enumerate(discount_ranges):
            if min_range <= discount_percent <= max_range:
                discount_counts[i] += 1

    total_scenarios = len(discount_scenarios)
    actual_probabilities = [count / total_scenarios for count in discount_counts]

    print("Actual Probability Distribution:")
    for i, (min_range, max_range) in enumerate(discount_ranges):
        print(f"Range {min_range}-{max_range}: {actual_probabilities[i]:.2f}")

    print(f"Total scenarios: {total_scenarios}")
