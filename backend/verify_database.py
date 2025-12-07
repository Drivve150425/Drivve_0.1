from database import DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SERVER, POSTGRES_PORT, POSTGRES_DB
import psycopg2

def verify_database_config():
    print("🔍 Verifying DRIVVE Database Configuration")
    print("=" * 50)
    
    # Print configuration
    print(f"📊 User: {POSTGRES_USER}")
    print(f"🔐 Password: {POSTGRES_PASSWORD}")
    print(f"🌐 Server: {POSTGRES_SERVER}")
    print(f"🔌 Port: {POSTGRES_PORT}")
    print(f"🗄️ Database: {POSTGRES_DB}")
    print(f"🔗 URL: {DATABASE_URL}")
    print("-" * 50)
    
    # Test connection
    try:
        print("1️⃣ Testing PostgreSQL connection...")
        conn = psycopg2.connect(
            host=POSTGRES_SERVER,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            database="postgres"  # Connect to default database first
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ PostgreSQL connection successful!")
        print(f"🐘 Version: {version[:100]}...")
        
        # Check if our database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (POSTGRES_DB,))
        db_exists = cursor.fetchone()
        
        if db_exists:
            print(f"✅ Database '{POSTGRES_DB}' exists")
            
            # Test connection to our specific database
            cursor.close()
            conn.close()
            
            print("2️⃣ Testing connection to DRIVVE database...")
            conn = psycopg2.connect(
                host=POSTGRES_SERVER,
                port=POSTGRES_PORT,
                user=POSTGRES_USER,
                password=POSTGRES_PASSWORD,
                database=POSTGRES_DB
            )
            
            cursor = conn.cursor()
            cursor.execute("SELECT current_database();")
            current_db = cursor.fetchone()[0]
            print(f"✅ Connected to '{current_db}' successfully!")
            
        else:
            print(f"⚠️ Database '{POSTGRES_DB}' does not exist")
            print("💡 Creating database...")
            
            conn.autocommit = True
            cursor.execute(f'CREATE DATABASE "{POSTGRES_DB}"')
            print(f"🎉 Database '{POSTGRES_DB}' created!")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 DATABASE CONFIGURATION IS CORRECT!")
        print("🚀 Ready to create tables and start backend!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        
        if "password authentication failed" in str(e):
            print("💡 Fix: Check password in pgAdmin4")
        elif "does not exist" in str(e):
            print("💡 Fix: Create database in pgAdmin4")
        elif "could not connect" in str(e):
            print("💡 Fix: Ensure PostgreSQL service is running")
        
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = verify_database_config()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Run: python create_tables.py")
        print("2. Run: python main.py") 
        print("3. Visit: http://localhost:8000/docs")
    else:
        print("\n🔧 Fix the issues above and try again")
