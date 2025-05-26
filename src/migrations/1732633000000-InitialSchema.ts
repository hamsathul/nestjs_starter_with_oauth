import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1732633000000 implements MigrationInterface {
    name = 'InitialSchema1732633000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if users table exists
        const usersTableExists = await queryRunner.hasTable("users");
        if (!usersTableExists) {
            // Create users table
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "email" character varying NOT NULL,
                    "password" character varying,
                    "firstName" character varying NOT NULL,
                    "lastName" character varying NOT NULL,
                    "avatar" character varying,
                    "provider" character varying NOT NULL DEFAULT 'local',
                    "providerId" character varying,
                    "status" character varying NOT NULL DEFAULT 'active',
                    "isEmailVerified" boolean NOT NULL DEFAULT false,
                    "emailVerificationToken" character varying,
                    "passwordResetToken" character varying,
                    "passwordResetExpires" TIMESTAMP,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                    CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
                )
            `);
        }

        // Check if roles table exists
        const rolesTableExists = await queryRunner.hasTable("roles");
        if (!rolesTableExists) {
            // Create roles table
            await queryRunner.query(`
                CREATE TABLE "roles" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" character varying NOT NULL,
                    "description" character varying,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
                    CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
                )
            `);
        }

        // Check if permissions table exists
        const permissionsTableExists = await queryRunner.hasTable("permissions");
        if (!permissionsTableExists) {
            // Create permissions table
            await queryRunner.query(`
                CREATE TABLE "permissions" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" character varying NOT NULL,
                    "description" character varying,
                    "resource" character varying NOT NULL,
                    "action" character varying NOT NULL,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
                    CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
                )
            `);
        }

        // Check if user_roles table exists
        const userRolesTableExists = await queryRunner.hasTable("user_roles");
        if (!userRolesTableExists) {
            // Create user_roles junction table
            await queryRunner.query(`
                CREATE TABLE "user_roles" (
                    "userId" uuid NOT NULL,
                    "roleId" uuid NOT NULL,
                    CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId")
                )
            `);
        }

        // Check if role_permissions table exists
        const rolePermissionsTableExists = await queryRunner.hasTable("role_permissions");
        if (!rolePermissionsTableExists) {
            // Create role_permissions junction table
            await queryRunner.query(`
                CREATE TABLE "role_permissions" (
                    "roleId" uuid NOT NULL,
                    "permissionId" uuid NOT NULL,
                    CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
                )
            `);
        }

        // Create indexes if they don't exist
        const indexes = await queryRunner.query(`
            SELECT indexname FROM pg_indexes WHERE tablename IN ('user_roles', 'role_permissions')
        `);
        const existingIndexes = indexes.map((idx: any) => idx.indexname);

        if (!existingIndexes.includes('IDX_user_roles_userId')) {
            await queryRunner.query(`CREATE INDEX "IDX_user_roles_userId" ON "user_roles" ("userId")`);
        }
        if (!existingIndexes.includes('IDX_user_roles_roleId')) {
            await queryRunner.query(`CREATE INDEX "IDX_user_roles_roleId" ON "user_roles" ("roleId")`);
        }
        if (!existingIndexes.includes('IDX_role_permissions_roleId')) {
            await queryRunner.query(`CREATE INDEX "IDX_role_permissions_roleId" ON "role_permissions" ("roleId")`);
        }
        if (!existingIndexes.includes('IDX_role_permissions_permissionId')) {
            await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permissionId" ON "role_permissions" ("permissionId")`);
        }

        // Add foreign key constraints if they don't exist
        const foreignKeys = await queryRunner.query(`
            SELECT conname FROM pg_constraint WHERE contype = 'f' AND conrelid IN (
                SELECT oid FROM pg_class WHERE relname IN ('user_roles', 'role_permissions')
            )
        `);
        const existingForeignKeys = foreignKeys.map((fk: any) => fk.conname);

        if (!existingForeignKeys.includes('FK_user_roles_userId')) {
            await queryRunner.query(`
                ALTER TABLE "user_roles" 
                ADD CONSTRAINT "FK_user_roles_userId" 
                FOREIGN KEY ("userId") REFERENCES "users"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
        }

        if (!existingForeignKeys.includes('FK_user_roles_roleId')) {
            await queryRunner.query(`
                ALTER TABLE "user_roles" 
                ADD CONSTRAINT "FK_user_roles_roleId" 
                FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
        }

        if (!existingForeignKeys.includes('FK_role_permissions_roleId')) {
            await queryRunner.query(`
                ALTER TABLE "role_permissions" 
                ADD CONSTRAINT "FK_role_permissions_roleId" 
                FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
        }

        if (!existingForeignKeys.includes('FK_role_permissions_permissionId')) {
            await queryRunner.query(`
                ALTER TABLE "role_permissions" 
                ADD CONSTRAINT "FK_role_permissions_permissionId" 
                FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
        }

        // Insert default roles if they don't exist
        const existingRoles = await queryRunner.query(`SELECT name FROM roles`);
        const roleNames = existingRoles.map((role: any) => role.name);

        if (!roleNames.includes('super-admin')) {
            await queryRunner.query(`
                INSERT INTO "roles" ("id", "name", "description") VALUES 
                (uuid_generate_v4(), 'super-admin', 'Super Administrator with full system access')
            `);
        }
        if (!roleNames.includes('admin')) {
            await queryRunner.query(`
                INSERT INTO "roles" ("id", "name", "description") VALUES 
                (uuid_generate_v4(), 'admin', 'Administrator with management privileges')
            `);
        }
        if (!roleNames.includes('user')) {
            await queryRunner.query(`
                INSERT INTO "roles" ("id", "name", "description") VALUES 
                (uuid_generate_v4(), 'user', 'Regular user with basic access')
            `);
        }

        // Insert default permissions if they don't exist
        const existingPermissions = await queryRunner.query(`SELECT name FROM permissions`);
        const permissionNames = existingPermissions.map((perm: any) => perm.name);

        const defaultPermissions = [
            { name: 'user:create', description: 'Create new users', resource: 'user', action: 'create' },
            { name: 'user:read', description: 'View user information', resource: 'user', action: 'read' },
            { name: 'user:update', description: 'Update user information', resource: 'user', action: 'update' },
            { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
            { name: 'role:create', description: 'Create new roles', resource: 'role', action: 'create' },
            { name: 'role:read', description: 'View role information', resource: 'role', action: 'read' },
            { name: 'role:update', description: 'Update role information', resource: 'role', action: 'update' },
            { name: 'role:delete', description: 'Delete roles', resource: 'role', action: 'delete' },
            { name: 'permission:create', description: 'Create new permissions', resource: 'permission', action: 'create' },
            { name: 'permission:read', description: 'View permission information', resource: 'permission', action: 'read' },
            { name: 'permission:update', description: 'Update permission information', resource: 'permission', action: 'update' },
            { name: 'permission:delete', description: 'Delete permissions', resource: 'permission', action: 'delete' }
        ];

        for (const permission of defaultPermissions) {
            if (!permissionNames.includes(permission.name)) {
                await queryRunner.query(`
                    INSERT INTO "permissions" ("id", "name", "description", "resource", "action") VALUES 
                    (uuid_generate_v4(), '${permission.name}', '${permission.description}', '${permission.resource}', '${permission.action}')
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_roleId"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_roleId"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_userId"`);

        // Remove indexes
        await queryRunner.query(`DROP INDEX "IDX_role_permissions_permissionId"`);
        await queryRunner.query(`DROP INDEX "IDX_role_permissions_roleId"`);
        await queryRunner.query(`DROP INDEX "IDX_user_roles_roleId"`);
        await queryRunner.query(`DROP INDEX "IDX_user_roles_userId"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
