import psycopg2
import subprocess
import sys
from datetime import datetime
from config import DB_CONFIG, FILE_PATH


INIT_SQL = FILE_PATH["init"]
DELETE_SQL = FILE_PATH["delete"]
SEED_SQL = FILE_PATH["seed"]


def run_sql_file(filename):
    with open(filename, "r") as file:
        sql = file.read()
    try:
        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                conn.commit()
                print(f"Successfully executed {filename}")
    except Exception as e:
        print(f"Error executing {filename}: {e}")
        sys.exit(1)


def backup_db():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"./backups/backup_{timestamp}.sql"

    cmd = [
        "pg_dump",
        f"--host={DB_CONFIG['host']}",
        f"--port={DB_CONFIG['port']}",
        f"--username={DB_CONFIG['User']}",
        "-F",
        "c",
        "-b",
        "-v",
        "-f",
        backup_file,
        DB_CONFIG["dbname"],
    ]

    print(f"Backing up database to {backup_file}")
    try:
        subprocess.run(cmd, check=True)
        print("Backup completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Backup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python manage_db.py [init|delete|seed|backup]")
        sys.exit(1)

    action = sys.argv[1].lower()

    if action == "init":
        run_sql_file(INIT_SQL)
    elif action == "delete":
        run_sql_file(DELETE_SQL)
    elif action == "seed":
        run_sql_file(SEED_SQL)
    elif action == "backup":
        backup_db()
    else:
        print("Invalid action. Choose from: init, delete, seed, backup")
        sys.exit(1)
