
import * as SQLite from 'expo-sqlite';

let db;

// ========================================
// INITIALIZE DATABASE
// ========================================

export async function initializeDatabase() {
  db = await SQLite.openDatabaseAsync('docunest.db');

  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Categories table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `);

  // Documents table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      fileType TEXT NOT NULL,
      fileSize INTEGER DEFAULT 0,
      categoryId INTEGER,
      dateAdded TEXT NOT NULL,
      fileUri TEXT,
      isFavorite INTEGER DEFAULT 0,
      content TEXT,
      FOREIGN KEY (categoryId)
        REFERENCES categories(id)
        ON DELETE SET NULL
    );
  `);

  // Migration tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      migrationName TEXT PRIMARY KEY,
      completedAt TEXT NOT NULL
    );
  `);

  // Check and add content column for existing databases
  const documentColumns = await db.getAllAsync(
    'PRAGMA table_info(documents)'
  );

  const hasContentColumn = documentColumns.some(
    column => column.name === 'content'
  );

  if (!hasContentColumn) {
    await db.execAsync(`
      ALTER TABLE documents
      ADD COLUMN content TEXT;
    `);

    console.log('Rich text content column added!');
  }

  // Remove old sample documents only once
  await removeOldSampleDocuments();

  // Insert default categories
  await seedCategories();

  console.log('DocuNest database initialized!');

  return db;
}

// ========================================
// REMOVE OLD SAMPLE DOCUMENTS
// ========================================

async function removeOldSampleDocuments() {
  const migration = await db.getFirstAsync(
    `SELECT migrationName
     FROM app_migrations
     WHERE migrationName = ?`,
    ['remove_sample_documents_v1']
  );

  if (migration) return;

  const sampleNames = [
    'Mobile Computing Notes',
    'Software Testing Assignment',
    'React Native Tutorial',
    'Database Management Notes',
    'Network Security Slides',
    'My CV',
    'Personal ID Copy',
    'Personal Information',
    'Project Proposal',
    'Meeting Report',
    'Monthly Budget',
    'Payment Receipt',
    'Bank Statement',
    'Travel Photograph',
    'Important Information',
  ];

  for (const name of sampleNames) {
    await db.runAsync(
      'DELETE FROM documents WHERE name = ?',
      [name]
    );
  }

  await db.runAsync(
    `INSERT INTO app_migrations (migrationName, completedAt)
     VALUES (?, ?)`,
    ['remove_sample_documents_v1', new Date().toISOString()]
  );

  console.log('Old sample documents removed successfully!');
}

// ========================================
// SEED DEFAULT CATEGORIES
// ========================================

async function seedCategories() {
  const sampleCategories = [
    {
      name: 'University',
      description: 'University notes and academic documents',
    },
    {
      name: 'Personal',
      description: 'Personal documents and records',
    },
    {
      name: 'Work',
      description: 'Work-related documents',
    },
    {
      name: 'Finance',
      description: 'Financial documents and records',
    },
    {
      name: 'Other',
      description: 'Other important documents',
    },
  ];

  for (const category of sampleCategories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (name, description)
       VALUES (?, ?)`,
      [category.name, category.description]
    );
  }
}

// ========================================
// DOCUMENT FUNCTIONS
// ========================================

// GET ALL DOCUMENTS

export async function getAllDocuments() {
  return await db.getAllAsync(`
    SELECT documents.*, categories.name AS categoryName
    FROM documents
    LEFT JOIN categories
    ON documents.categoryId = categories.id
    ORDER BY dateAdded DESC
  `);
}

// GET DOCUMENT BY ID

export async function getDocumentById(id) {
  return await db.getFirstAsync(
    `SELECT documents.*, categories.name AS categoryName
     FROM documents
     LEFT JOIN categories
     ON documents.categoryId = categories.id
     WHERE documents.id = ?`,
    [id]
  );
}

// ADD DOCUMENT
// Content is optional to preserve file import functionality.

export async function addDocument(
  name,
  description,
  fileType,
  fileSize,
  categoryId,
  fileUri,
  content = null
) {
  if (!name || !name.trim()) {
    throw new Error('Document name is required.');
  }

  if (!fileType) {
    throw new Error('File type is required.');
  }

  const result = await db.runAsync(
    `INSERT INTO documents
     (name, description, fileType, fileSize,
      categoryId, dateAdded, fileUri, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      description?.trim() || '',
      fileType,
      fileSize || 0,
      categoryId || null,
      new Date().toISOString(),
      fileUri || null,
      content,
    ]
  );

  return result;
}

// UPDATE DOCUMENT
// Content is optional to preserve existing edit functionality.

export async function updateDocument(
  id,
  name,
  description,
  categoryId,
  content
) {
  if (!name || !name.trim()) {
    throw new Error('Document name is required.');
  }

  let result;

  if (content !== undefined) {
    result = await db.runAsync(
      `UPDATE documents
       SET name = ?,
           description = ?,
           categoryId = ?,
           content = ?
       WHERE id = ?`,
      [
        name.trim(),
        description?.trim() || '',
        categoryId || null,
        content,
        id,
      ]
    );
  } else {
    result = await db.runAsync(
      `UPDATE documents
       SET name = ?,
           description = ?,
           categoryId = ?
       WHERE id = ?`,
      [
        name.trim(),
        description?.trim() || '',
        categoryId || null,
        id,
      ]
    );
  }

  if (result.changes === 0) {
    throw new Error('Document not found.');
  }

  return result;
}

// DELETE DOCUMENT

export async function deleteDocument(id) {
  const result = await db.runAsync(
    'DELETE FROM documents WHERE id = ?',
    [id]
  );

  if (result.changes === 0) {
    throw new Error('Document not found.');
  }

  return result;
}

// ========================================
// CATEGORY FUNCTIONS
// ========================================

// GET ALL CATEGORIES

export async function getCategories() {
  return await db.getAllAsync(`
    SELECT categories.*, COUNT(documents.id) AS documentCount
    FROM categories
    LEFT JOIN documents
    ON categories.id = documents.categoryId
    GROUP BY categories.id
    ORDER BY categories.name ASC
  `);
}

// ADD CATEGORY

export async function addCategory(name, description) {
  const categoryName = name?.trim();
  const categoryDescription = description?.trim() || '';

  if (!categoryName) {
    throw new Error('Category name is required.');
  }

  return await db.runAsync(
    `INSERT INTO categories (name, description)
     VALUES (?, ?)`,
    [categoryName, categoryDescription]
  );
}

// UPDATE CATEGORY

export async function updateCategory(id, name, description) {
  const categoryName = name?.trim();
  const categoryDescription = description?.trim() || '';

  if (!categoryName) {
    throw new Error('Category name is required.');
  }

  const result = await db.runAsync(
    `UPDATE categories
     SET name = ?, description = ?
     WHERE id = ?`,
    [categoryName, categoryDescription, id]
  );

  if (result.changes === 0) {
    throw new Error('Category not found.');
  }

  return result;
}

// DELETE CATEGORY

export async function deleteCategory(id) {
  const result = await db.runAsync(
    'DELETE FROM categories WHERE id = ?',
    [id]
  );

  if (result.changes === 0) {
    throw new Error('Category not found.');
  }

  return result;
}

// ========================================
// DASHBOARD FUNCTIONS
// ========================================

// RECENT DOCUMENTS

export async function getRecentDocuments() {
  return await db.getAllAsync(`
    SELECT documents.*, categories.name AS categoryName
    FROM documents
    LEFT JOIN categories
    ON documents.categoryId = categories.id
    ORDER BY dateAdded DESC
    LIMIT 5
  `);
}

// DASHBOARD STATISTICS

export async function getDashboardStats() {
  const documents = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM documents'
  );

  const categories = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM categories'
  );

  const storage = await db.getFirstAsync(
    'SELECT COALESCE(SUM(fileSize), 0) AS total FROM documents'
  );

  return {
    totalDocuments: documents.total,
    totalCategories: categories.total,
    totalStorage: storage.total,
  };
}
