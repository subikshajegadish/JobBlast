#!/usr/bin/env python
"""
Quick script to check if the backend is set up correctly and verify user accounts.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobtracker.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import connection

def check_database():
    """Check if database connection works"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection: OK")
        return True
    except Exception as e:
        print(f"❌ Database connection: FAILED - {e}")
        return False

def check_users():
    """List all users in the database"""
    users = User.objects.all()
    if users.exists():
        print(f"\n✅ Found {users.count()} user(s):")
        for user in users:
            print(f"   - Username: {user.username}, Email: {user.email}, Active: {user.is_active}")
    else:
        print("\n⚠️  No users found in database!")
        print("   Create a user with: python manage.py createsuperuser")
    return users.exists()

def check_migrations():
    """Check if migrations are applied"""
    from django.core.management import call_command
    from io import StringIO
    out = StringIO()
    try:
        call_command('showmigrations', '--list', stdout=out)
        migrations = out.getvalue()
        if '[X]' in migrations:
            print("✅ Migrations: Applied")
            return True
        else:
            print("⚠️  Migrations may not be applied")
            return False
    except Exception as e:
        print(f"❌ Error checking migrations: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("Backend Setup Check")
    print("=" * 50)
    
    db_ok = check_database()
    migrations_ok = check_migrations()
    users_exist = check_users()
    
    print("\n" + "=" * 50)
    if db_ok and migrations_ok and users_exist:
        print("✅ Backend is ready!")
    else:
        print("⚠️  Some issues found. Please fix them before using the API.")
        if not users_exist:
            print("\nTo create a user, run:")
            print("  python manage.py createsuperuser")
    print("=" * 50)

