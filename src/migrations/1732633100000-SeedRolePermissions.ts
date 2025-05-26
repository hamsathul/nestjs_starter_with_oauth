import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRolePermissions1732633100000 implements MigrationInterface {
    name = 'SeedRolePermissions1732633100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get role and permission IDs
        const superAdminRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'super-admin'`);
        const adminRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'admin'`);
        const userRole = await queryRunner.query(`SELECT id FROM roles WHERE name = 'user'`);

        const allPermissions = await queryRunner.query(`SELECT id FROM permissions`);
        const userPermissions = await queryRunner.query(`
            SELECT id FROM permissions WHERE name IN ('user:read', 'user:update')
        `);
        const adminPermissions = await queryRunner.query(`
            SELECT id FROM permissions WHERE 
            name IN ('user:create', 'user:read', 'user:update', 'role:read', 'permission:read')
        `);

        // Check existing role-permission relationships
        const existingRolePermissions = await queryRunner.query(`
            SELECT "roleId", "permissionId" FROM role_permissions
        `);
        const existingRelationships = new Set(
            existingRolePermissions.map((rp: any) => `${rp.roleId}:${rp.permissionId}`)
        );

        // Assign all permissions to super-admin
        if (superAdminRole.length > 0) {
            for (const permission of allPermissions) {
                const relationshipKey = `${superAdminRole[0].id}:${permission.id}`;
                if (!existingRelationships.has(relationshipKey)) {
                    await queryRunner.query(`
                        INSERT INTO "role_permissions" ("roleId", "permissionId") 
                        VALUES ('${superAdminRole[0].id}', '${permission.id}')
                    `);
                }
            }
        }

        // Assign admin permissions to admin role
        if (adminRole.length > 0) {
            for (const permission of adminPermissions) {
                const relationshipKey = `${adminRole[0].id}:${permission.id}`;
                if (!existingRelationships.has(relationshipKey)) {
                    await queryRunner.query(`
                        INSERT INTO "role_permissions" ("roleId", "permissionId") 
                        VALUES ('${adminRole[0].id}', '${permission.id}')
                    `);
                }
            }
        }

        // Assign basic permissions to user role
        if (userRole.length > 0) {
            for (const permission of userPermissions) {
                const relationshipKey = `${userRole[0].id}:${permission.id}`;
                if (!existingRelationships.has(relationshipKey)) {
                    await queryRunner.query(`
                        INSERT INTO "role_permissions" ("roleId", "permissionId") 
                        VALUES ('${userRole[0].id}', '${permission.id}')
                    `);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all role-permission assignments
        await queryRunner.query(`DELETE FROM "role_permissions"`);
    }
}
