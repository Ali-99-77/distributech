import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "dbname": os.environ.get("DB_NAME", "distributech"),
    "User": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", "postgres"),
}

FILE_PATH = {
    "init": "./commands/init_db.sql",
    "delete": "./commands/del_db.sql",
    "seed": "./commands/seed_db.sql",
    "backup": "./commands/backup_db.sql",
}

# python orchestrate.py create
# python orchestrate.py seed
# python orchestrate.py backup
# python orchestrate.py delete