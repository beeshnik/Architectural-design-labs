"""Encryption utilities for sensitive data."""
from cryptography.fernet import Fernet

from src.core.config import get_settings


def get_fernet() -> Fernet:
    """Get Fernet instance with encryption key."""
    settings = get_settings()
    # Ensure key is properly formatted for Fernet (32 bytes base64-encoded)
    key = settings.encryption_key.encode()[:32]
    # Pad or trim to 32 bytes
    key = key.ljust(32, b'0')[:32]
    import base64
    encoded_key = base64.urlsafe_b64encode(key)
    return Fernet(encoded_key)


def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return value
    fernet = get_fernet()
    return fernet.encrypt(value.encode()).decode()


def decrypt_value(encrypted_value: str) -> str:
    """Decrypt an encrypted string value."""
    if not encrypted_value:
        return encrypted_value
    fernet = get_fernet()
    return fernet.decrypt(encrypted_value.encode()).decode()
