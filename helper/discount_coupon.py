import random


def apply_discount(price,probabaility_of_discount, max_discount_percent,discount_ranges= [(1, 2), (3, 5), (6, 10), (11, 20)],discount_probabilities=[0.4, 0.3, 0.2, 0.1]):

    if max_discount_percent:
        discount_ranges= [(1, 2), (3, 5), (6, 10), (11, max_discount_percent)]
        
    # print( discount_ranges, discount_probabilities)
    # Generate a random number between 0 and 1
    random_number = random.random()

    if random_number <=probabaility_of_discount :  # Apply a discount in 20% of the attempts
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
        # In the remaining 80% of the attempts, keep the price the same
        return price, 0  # No discount applied

# Example usage:
original_price = 100  # Replace this with the price you want to apply discounts to
max_discount_percent = 0.15# Set the maximum discount percentage
probabaility_of_discount=0.15
discounted_price, discount_percent = apply_discount(original_price,probabaility_of_discount, max_discount_percent)
print(f"Original Price: ${original_price:.2f}")
if discount_percent > 0:
    print(f"Discount Percentage: {discount_percent}%")
    print(f"Discounted Price: ${discounted_price:.2f}")
else:
    print("No discount applied.")
