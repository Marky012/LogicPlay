======================================

BE commands:

cd backend

venv\\Scripts\\activate

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload



FE commands:

cd frontend

npm run dev -- --host



PC View:
(localhost)

\- http://127.0.0.1:5137 

\- http://localhost:5137



Mobile View: (\*works on same network/internet, dynamic)

\- http://192.168.56.1:5137 (sample)

\- http://192.168.100.112:5137 (sample)



======================================

Test teacher acc:

admin\_teacher

LogicPlay2024!



prof\_mark

mark123



teacher\_mark

mark123

Class Code
Y3A01S
7MKYKO
DM95AJ


======================================

Essentials:

\- running mobile live view

* Preview of the saved circuit
* Preview of circuit in the submission review modal


======================================

Update features:

\- implement a report generating feature for student to have a soft copy of its work, and then with the logical gate made by the player also the truth table, and timestamp(the date it is generated, name,)

- Fixed sidebar for student account
- Edit username and password for teacher account, also for student account
- 

======================================

Error:

\-


======================================

Bug:

* teacher view => player are logged as enrolled students - invalid?
* single student can submit the same assignment multiple times
* single assignmen tcan be graded unlimited times, put already submitted message if so
* class assignment from an already unenrolled class still appears
* fix teacher checking/grading UI


======================================

Notes:

\- maximum of 2-4 input (gates) (AND, OR, NOT => priority) (extra => NAND, NOR, XOR, XNOR), only one output

\- adding light mode for user adaptability and personalization (when claude sonnet resets)

\- the logo should look  like, minimal, modern, clean, techy, and has color palette of blue, white, etc. (calming color palette)

- teacher can regenerate the join code

secretkey

======================================

Questions:

- 
- 
- 


==================================================================
Global Disable: Added user-select: none; to the body element in index.css file. This tells the browser to prevent text selection for any element inside the body by default. This is what stops the annoying blue highlights when you click and drag gates.
Selective Enable: Since still want to be able to type in things like the "Save Circuit" modal, added a rule to re-enable text selection specifically for input and textarea elements.