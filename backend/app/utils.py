from pwdlib import PasswordHash

# pwdlib uses Argon2 by default for recommended hashing, replacing passlib
pwd_context = PasswordHash.recommended()

def get_password_hash(password: str):
    return pwd_context.hash(password)