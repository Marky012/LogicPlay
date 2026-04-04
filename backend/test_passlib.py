import traceback

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    print(pwd_context.hash('password'))
except Exception as e:
    with open('err.txt', 'w') as f:
        f.write(traceback.format_exc())
