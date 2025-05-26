const { AppDataSource } = require('./src/data-source.ts');

async function checkDatabase() {
  await AppDataSource.initialize();
  
  const result = await AppDataSource.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('Current tables:');
  result.forEach(row => console.log('  -', row.tablename));
  
  console.log('\nPosts table structure:');
  const postsStructure = await AppDataSource.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position");
  postsStructure.forEach(col => console.log('  -', col.column_name, ':', col.data_type, col.is_nullable === 'YES' ? '(nullable)' : '(not null)'));
  
  console.log('\nTotal record counts:');
  const users = await AppDataSource.query("SELECT COUNT(*) as count FROM users");
  const roles = await AppDataSource.query("SELECT COUNT(*) as count FROM roles");
  const permissions = await AppDataSource.query("SELECT COUNT(*) as count FROM permissions");
  const posts = await AppDataSource.query("SELECT COUNT(*) as count FROM posts");
  
  console.log('  - Users:', users[0].count);
  console.log('  - Roles:', roles[0].count);
  console.log('  - Permissions:', permissions[0].count);
  console.log('  - Posts:', posts[0].count);
  
  await AppDataSource.destroy();
}

checkDatabase().catch(console.error);
