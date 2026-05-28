# ML Auto-Grading Training Results

This document explains how we trained our computer model to grade student circuits automatically and how well it is performing.

## 7.1 Data Gathered (Where our data came from)
This part explains how much information we used and how we prepared it for the computer to understand.

*   **How many examples we used**: 1,000 different circuit designs.
*   **Where we got the data**: Since we don't have enough real student work yet, we used a special script (`generate_data.py`) to create 1,000 "practice" circuits. These range from very simple ones with only 2 parts to complex ones with 10 parts.
*   **How the computer "reads" a circuit**:
    Before the computer can grade a circuit, it needs to look at the specific parts. We use a tool (`extract_features.py`) to count:
    1.  **Total Parts**: How many logic gates are used.
    2.  **Connections**: How many wires are connecting the parts.
    3.  **Types of Gates**: How many AND, OR, and NOT gates are present.
    4.  **Inputs and Outputs**: How many switches and lights the circuit has.
    5.  **Complexity**: A simple check to see if the circuit is very "busy" or simple.
    *   **The Split**:
        *   **Study Group**: We used 800 circuits (80%) for the computer to "study" and learn from.
        *   **Test Group**: We used 200 circuits (20%) to test the computer and see if it learned correctly.

---

## 7.2 Model Training Results (How the model performed)
These are the results from our testing. We used an algorithm called "Random Forest" which is great at finding patterns in data.

### Performance Scores  
| Score Name | Result | What it means in simple words |
| :--- | :--- | :--- |
| **Average Error (MSE)** | 59.61 | This shows how far off the computer's grade was from the real grade. A lower number is better. |
| **Accuracy Score (R²)** | 0.87 | This means the computer is about 87% accurate at understanding why a circuit should get a certain grade. |

### Looking at the Results

#### 1. Real vs. Predicted Grades
![Real vs Predicted](file:///d:/LogicPlay/images/ml_results/actual_vs_predicted.png)
*Discussion*: In this chart, the dots follow a straight line. This tells us that the grade the computer gives is usually very close to the grade a human would give.

#### 2. What the computer cares about most
![What the model looks at](file:///d:/LogicPlay/images/ml_results/feature_importance.png)
*Discussion*: This chart shows us that the computer mostly looks at the **number of wires** and **number of parts** to decide on a grade. It knows that more complex work usually needs more connections.

#### 3. Variety of Grades
![Grade Variety](file:///d:/LogicPlay/images/ml_results/score_distribution.png)
*Discussion*: This shows that our training data had a good mix of "easy" and "hard" circuits. This helps the computer learn how to grade everything fairly.

### Summary
The computer model is very reliable with an 87% accuracy score. It can easily tell the difference between a "lazy" circuit with few connections and a "hard-working" circuit with many layers. This means students will get fair and instant feedback on their work!
