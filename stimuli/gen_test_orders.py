import numpy as np
import json
import csv

n_orders = 100

HF_count = 4
LF_count = 1

rep_in_block = 1 #creates the number of trials in each block
near_distance_rep = 3 #sets number of near distance trials in each block
# for 1:2 this creates N = 72 trials in each ND block
# for 1:4 this creates N = 60 trials

HF_items = {"blit":15, "grah":60, "clate":195, "noobda":240}
LF_items = {"pim":105, "gorm":150, "gled":285, "noom":330}

# Create a combined item dictionary with frequency information
all_items = {}
for item, angle in HF_items.items():
    all_items[item] = {"frequency": "high", "angle": angle}
for item, angle in LF_items.items():
    all_items[item] = {"frequency": "low", "angle": angle}

trial_blocks = []

for block in range(n_orders):
    # First generate near distance trials
    near_distance_targets = []
    
    # Repeat HF items according to rep_in_block
    for _ in range(HF_count):
        near_distance_targets.extend(list(HF_items.keys()) * rep_in_block)
    
    # Repeat LF items according to rep_in_block
    for _ in range(LF_count):
        near_distance_targets.extend(list(LF_items.keys()) * rep_in_block)
    
    near_distance_targets = near_distance_targets * near_distance_rep

    # Build trial block structure
    near_distance_trials = []

    for trial_id, target in enumerate(near_distance_targets, 1):
        angle_offset_options = np.concatenate([np.arange(-11,0), np.arange(1,12)])
        angle_offset = int(np.random.choice(angle_offset_options))
        current_angle = all_items[target]["angle"]
        
        if angle_offset > 0:
            next_nearest_angle = (current_angle - 45) % 360
        else:
            next_nearest_angle = (current_angle + 45) % 360
        
        # Find the item with the matching angle
        next_nearest_label = [item for item, data in all_items.items() if data["angle"] == next_nearest_angle][0]

        displayed_angle = current_angle + angle_offset
        trial = {
            "trial_id": trial_id,
            "target": {
                "nearest_trained_label": target,
                "nearest_trained_frequency": all_items[target]["frequency"],
                "nearest_trained_angle": all_items[target]["angle"],
                "displayed_angle": displayed_angle,
                "trial_type": "near_distance",
                "is_critical": False,
                "next_nearest_label": next_nearest_label,
                "next_nearest_angle": next_nearest_angle,
            }
        }
        near_distance_trials.append(trial)
    

    # Generate far distance trials (64 total)
    # Each of the 8 angle pairs appears 8 times with randomized angles
    # Angles should be between 11° and 22° from each of two compass directions
    # At least 2° closer to one direction than another
    
    # Define all angle pairs (adjacent angles on the compass)
    # Format: (angle1, angle2, item1, item2, is_critical)
    angle_pairs = [
        (15, 60, "blit", "grah", False),  # HF-HF
        (60, 15, "grah", "blit", False),  # HF-HF
        (60, 105, "grah", "pim", True),   # HF-LF (critical)
        (105, 60, "pim", "grah", True),   # HF-LF (critical)
        (105, 150, "pim", "gorm", False), # LF-LF
        (150, 105, "gorm", "pim", False), # LF-LF
        (150, 195, "gorm", "clate", True), # LF-HF (critical)
        (195, 150, "clate", "gorm", True), # LF-HF (critical)
        (195, 240, "clate", "noobda", False), # HF-HF
        (240, 195, "noobda", "clate", False), # HF-HF
        (240, 285, "noobda", "gled", True), # HF-LF (critical)
        (285, 240, "gled", "noobda", True), # HF-LF (critical)
        (285, 330, "gled", "noom", False), # LF-LF
        (330, 285, "noom", "gled", False), # LF-LF
        (330, 15, "noom", "blit", False), # LF-HF
        (15, 330, "blit", "noom", False), # LF-HF
    ]
    
    far_distance_trials = []
    
    # Helper function to calculate angular distance (handling wrap-around)
    def angular_distance(a1, a2):
        diff = abs(a1 - a2)
        return min(diff, 360 - diff)
    
    # Generate 4 trials for each pair (16 pairs × 4 = 64 total)
    # Each pair appears 4 times, ensuring each angle is nearest at least once per pair direction
    # Since angles are 45° apart, adding 11-22° to angle1 makes it 11-22° from angle1
    # and 23-34° from angle2, so angle1 is clearly closer (by at least 2°)
    for angle1, angle2, item1, item2, is_critical in angle_pairs:
        for _ in range(4):
            # Add 11-22 degrees to angle1, making it the nearest
            # This ensures displayed_angle is 11-22° from angle1
            # No modulo needed since max angle is 330° + 22° = 352° < 360°
            offset = int(np.random.randint(11, 23))
            displayed_angle = angle1 + offset
            
            # angle1 is guaranteed to be closer since angles are 45° apart
            # (displayed_angle is 11-22° from angle1, so 23-34° from angle2)
            nearest_angle = angle1
            nearest_label = item1
            
            trial = {
                "trial_id": len(near_distance_trials) + len(far_distance_trials) + 1,
                "target": {
                    "nearest_trained_label": nearest_label,
                    "nearest_trained_frequency": all_items[nearest_label]["frequency"],
                    "nearest_trained_angle": nearest_angle,
                    "displayed_angle": displayed_angle,
                    "trial_type": "far_distance",
                    "is_critical": is_critical,
                    "next_nearest_label": item2,
                    "next_nearest_angle": angle2,
                }
            }
            far_distance_trials.append(trial)
    # shuffle near and far distance trials seperately
    np.random.shuffle(near_distance_trials)
    np.random.shuffle(far_distance_trials)
    
    first_near_distance_trial_count = (len(HF_items)*HF_count+len(LF_items)*LF_count)*rep_in_block #24 for 1:2 ratio, 20 for 1:4 ratio
    first_set_near_distance_trials = near_distance_trials[:first_near_distance_trial_count]
    remaining_near_distance_trials = near_distance_trials[first_near_distance_trial_count:]
    rest_of_trials = remaining_near_distance_trials + far_distance_trials
    np.random.shuffle(rest_of_trials)

    # Combine near and far distance trials
    all_trials = first_set_near_distance_trials + rest_of_trials
    
    # Re-number trial IDs sequentially
    for i, trial in enumerate(all_trials, 1):
        trial["trial_id"] = i
    
    trial_blocks.append({
        "block_id": block + 1,
        "trials": all_trials
    })

# Build JS-style test trials array with block structure and write to a JS file
js_blocks = []
for block in trial_blocks:
    block_entry = {"block_id": block["block_id"], "trials": []}
    for trial in block["trials"]:
        trial_type = trial["target"]["trial_type"]
        
        if trial_type == "near_distance":
            # Near distance trials
            js_trial = {
                "trial_id": trial["trial_id"],
                "angle": trial["target"]["displayed_angle"],
                "label": trial["target"]["nearest_trained_label"],
                "nearest_trained_angle": trial["target"]["nearest_trained_angle"],
                "next_nearest_label": trial["target"]["next_nearest_label"],
                "next_nearest_angle": trial["target"]["next_nearest_angle"],
                "trial_type": "near_distance",
                "is_critical": trial["target"]["is_critical"],
                "targetFreq": "HF" if trial["target"]["nearest_trained_frequency"] == "high" else "LF"
            }
        elif trial_type == "far_distance":
            # Far distance trials
            js_trial = {
                "trial_id": trial["trial_id"],
                "angle": trial["target"]["displayed_angle"],
                "label": trial["target"]["nearest_trained_label"],
                "nearest_trained_angle": trial["target"]["nearest_trained_angle"],
                "next_nearest_label": trial["target"]["next_nearest_label"],
                "next_nearest_angle": trial["target"]["next_nearest_angle"],
                "trial_type": "far_distance",
                "is_critical": trial["target"]["is_critical"],
                "targetFreq": "HF" if trial["target"]["nearest_trained_frequency"] == "high" else "LF"
            }
        
        block_entry["trials"].append(js_trial)
    js_blocks.append(block_entry)

with open(f"stimuli/trial_orders/{LF_count}_{HF_count}_test_trials.js", "w") as f:
    f.write("const test_trials_data = ")
    json.dump(js_blocks, f, indent=4)
    f.write(";\n")

# Write to CSV file for spot-checking
csv_rows = []
for block in trial_blocks:
    for trial in block["trials"]:
        trial_type = trial["target"]["trial_type"]
        base_row = {
            "block_id": block["block_id"],
            "trial_id": trial["trial_id"],
            "trial_type": trial_type,
            "displayed_angle": trial["target"]["displayed_angle"],
            "nearest_trained_label": trial["target"]["nearest_trained_label"],
            "nearest_trained_angle": trial["target"]["nearest_trained_angle"],
            "nearest_trained_frequency": trial["target"]["nearest_trained_frequency"],
            "next_nearest_label": trial["target"]["next_nearest_label"],
            "next_nearest_angle": trial["target"]["next_nearest_angle"],
            "is_critical": trial["target"]["is_critical"]
        }
        
        csv_rows.append(base_row)

with open(f"stimuli/trial_orders/{LF_count}_{HF_count}_test_trials.csv", "w", newline="") as f:
    fieldnames = ["block_id", "trial_id", "trial_type", "displayed_angle", "nearest_trained_label", 
                  "nearest_trained_angle", "nearest_trained_frequency", "next_nearest_label", 
                  "next_nearest_angle", "is_critical"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(csv_rows)
