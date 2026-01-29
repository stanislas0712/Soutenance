from .base import *  # noqa

DEBUG = True

if not SECRET_KEY:
    # Development convenience only
    SECRET_KEY = "dev-insecure-change-me"

ALLOWED_HOSTS = ALLOWED_HOSTS or ["localhost", "127.0.0.1"]

