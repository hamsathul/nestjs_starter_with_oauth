#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the database by running migrations and seeding initial data.
 * Make sure your database connection is configured properly in your .env file.
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting database setup...\n');

// Function to run shell commands
function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`📦 ${description}...`);
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr && !stderr.includes('warning')) {
                console.error(`⚠️  Warning: ${stderr}`);
            }
            if (stdout) {
                console.log(stdout);
            }
            console.log(`✅ ${description} completed\n`);
            resolve();
        });
    });
}

async function setupDatabase() {
    try {
        // Check if we have a .env file
        const fs = require('fs');
        if (!fs.existsSync('.env')) {
            console.log('⚠️  No .env file found. Creating one from .env.example...');
            if (fs.existsSync('.env.example')) {
                fs.copyFileSync('.env.example', '.env');
                console.log('✅ Created .env file from .env.example');
                console.log('🔧 Please update your database credentials in the .env file before continuing.\n');
                return;
            } else {
                console.log('❌ No .env.example file found. Please create a .env file with your database configuration.');
                return;
            }
        }

        // Show migration status
        await runCommand('npm run migration:show', 'Checking migration status');

        // Run migrations
        await runCommand('npm run migration:run', 'Running database migrations');

        console.log('🎉 Database setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Start your application: npm run start:dev');
        console.log('   2. Check the API documentation at: http://localhost:3000/api');
        console.log('   3. Register a new user or use the seeded admin account');

    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   1. Make sure your database server is running');
        console.log('   2. Check your database credentials in the .env file');
        console.log('   3. Ensure the database exists (create it if needed)');
        console.log('   4. Check the database connection and SSL settings');
        process.exit(1);
    }
}

// Run the setup
setupDatabase();
