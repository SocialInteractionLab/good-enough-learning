import numpy as np
import json
import csv

n_blocks = 10

HF_count = 4
LF_count = 1

rep_in_block = 1

HF_items = {"blit":15, "grah":60, "clate":195, "noobda":240}
LF_items = {"pim":105, "gorm":150, "gled":285, "noom":330}

# Create a combined item dictionary with frequency information
all_items = {}
for item, angle in HF_items.items():
    all_items[item] = {"frequency": "high", "angle": angle}
for item, angle in LF_items.items():
    all_items[item] = {"frequency": "low", "angle": angle}

trial_blocks = []

for block in range(n_blocks):
    targets = []
    foils = []
    
    # Repeat HF items according to rep_in_block
    for _ in range(HF_count):
        targets.extend(list(HF_items.keys()) * rep_in_block)
    
    # Repeat LF items according to rep_in_block
    for _ in range(LF_count):
        targets.extend(list(LF_items.keys()) * rep_in_block)
    
    # Shuffle targets ensuring no consecutive repeats
    valid_shuffle = False
    while not valid_shuffle:
        np.random.shuffle(targets)
        # Check that no two consecutive targets are the same
        valid_shuffle = all(targets[i] != targets[i+1] for i in range(len(targets)-1))
    
    # Assign target and foil sides - alternate left/right and shuffle
    target_sides = ["left", "right"] * (len(targets) // 2)
    if len(targets) % 2 == 1:
        target_sides.append("left")
    np.random.shuffle(target_sides)
    
    # Foil sides are opposite of target sides
    foil_sides = ["right" if side == "left" else "left" for side in target_sides]

    # Create foils by pairing with different items while maintaining counts
    # Use a derangement approach: shuffle targets and ensure no position matches
    foils = targets.copy()
    valid_derangement = False
    max_attempts = 1000
    attempts = 0
    
    while not valid_derangement and attempts < max_attempts:
        np.random.shuffle(foils)
        # Check that no foil matches its corresponding target
        valid_derangement = all(foils[i] != targets[i] for i in range(len(targets)))
        attempts += 1
    
    # If we couldn't create a valid derangement, use a fallback approach
    if not valid_derangement:
        # Create a list of all unique items from targets
        unique_items = list(set(targets))
        foils = []
        for i, target in enumerate(targets):
            # Find an item that's different from the target
            # Prefer items that appear in the target list to maintain frequency distribution
            candidates = [item for item in targets if item != target]
            if not candidates:
                # Fallback: use any item from unique_items that's not the target
                candidates = [item for item in unique_items if item != target]
            if candidates:
                foils.append(np.random.choice(candidates))
            else:
                # Last resort: use a random item from all items (shouldn't happen)
                all_unique = list(set(HF_items.keys()) | set(LF_items.keys()))
                foils.append(np.random.choice([item for item in all_unique if item != target]))
    
    # Build trial block structure
    block_trials = []
    for trial_id, (target, foil, target_side, foil_side) in enumerate(zip(targets, foils, target_sides, foil_sides), 1):
        trial = {
            "trial_id": trial_id,
            "target": {
                "label": target,
                "frequency": all_items[target]["frequency"],
                "angle": all_items[target]["angle"],
                "side": target_side
            },
            "foil": {
                "label": foil,
                "frequency": all_items[foil]["frequency"],
                "angle": all_items[foil]["angle"],
                "side": foil_side
            }
        }
        block_trials.append(trial)
    
    trial_blocks.append({
        "block_id": block + 1,
        "trials": block_trials
    })

# Build JS-style training trials array with block structure and write to a JS file
js_blocks = []
for block in trial_blocks:
    block_entry = {"block_id": block["block_id"], "trials": []}
    for trial in block["trials"]:
        target = trial["target"]["label"]
        foil = trial["foil"]["label"]
        t_side = trial["target"]["side"]
        # left/right labels depend on which side the target is on
        if t_side == "left":
            left_label = target
            right_label = foil
        else:
            left_label = foil
            right_label = target

        angle = trial["target"]["angle"]
        freq = trial["target"]["frequency"]
        freq_code = "HF" if freq == "high" else "LF"

        block_entry["trials"].append({
            "trial_id": trial["trial_id"],
            "angle": angle,
            "leftLabel": left_label,
            "rightLabel": right_label,
            "target": target,
            "targetFreq": freq_code
        })
    js_blocks.append(block_entry)

with open(f"stimuli/trial_orders/{LF_count}_{HF_count}_training_trials.js", "w") as f:
    f.write("const training_trials_data = ")
    json.dump(js_blocks, f, indent=4)
    f.write(";\n")

# Write to CSV file for spot-checking
csv_rows = []
for block in trial_blocks:
    for trial in block["trials"]:
        csv_rows.append({
            "block_id": block["block_id"],
            "trial_id": trial["trial_id"],
            "target_name": trial["target"]["label"],
            "target_frequency": trial["target"]["frequency"],
            "target_angle": trial["target"]["angle"],
            "target_side": trial["target"]["side"],
            "foil_name": trial["foil"]["label"],
            "foil_frequency": trial["foil"]["frequency"],
            "foil_angle": trial["foil"]["angle"],
            "foil_side": trial["foil"]["side"]
        })

with open(f"stimuli/trial_orders/{LF_count}_{HF_count}_training_trials.csv", "w", newline="") as f:
    fieldnames = ["block_id", "trial_id", "target_name", "target_frequency", "target_angle", "target_side",
                  "foil_name", "foil_frequency", "foil_angle", "foil_side"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(csv_rows)
